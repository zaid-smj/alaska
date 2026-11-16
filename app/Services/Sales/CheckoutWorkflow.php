<?php

namespace App\Services\Sales;

use App\Models\Product;
use App\Models\Sales\SalesCheckoutPreview;
use App\Models\Sales\SalesCheckoutSettings;
use App\Models\Sales\SalesRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutWorkflow
{
    private function settings(string $method): SalesCheckoutSettings
    {
        $query = SalesCheckoutSettings::query();
        if (DB::transactionLevel() > 0) {
            $query->sharedLock();
        }$settings = $query->firstOrFail();
        if (! $settings->checkout_enabled) {
            throw ValidationException::withMessages(['checkout' => 'Checkout is not enabled. Quote requests remain available.']);
        }
        if (! in_array($method, ['bank_transfer', 'cod'], true) || ! ($method === 'cod' ? $settings->cod_enabled : $settings->bank_transfer_enabled)) {
            throw ValidationException::withMessages(['payment_method' => 'Select an available payment method.']);
        }
        if ($method === 'bank_transfer' && empty($settings->bank_accounts)) {
            throw ValidationException::withMessages(['payment_method' => 'Bank instructions are not configured.']);
        }

        return $settings;
    }

    private function snapshot(array $items, string $method): array
    {
        $settings = $this->settings($method);
        Product::whereIn('id', array_column($items, 'product_id'))->orderBy('id')->sharedLock()->get();
        $pricing = app(CheckoutCalculator::class)->checkout($items, $settings);
        if ($pricing['requires_quote']) {
            return $pricing + ['quote_url' => url('/quote.html')];
        }

        return ['payment_method' => $method, 'pricing' => $pricing, 'payment_instructions' => $settings->publicInstructions($method)];
    }

    public function preview(array $input, string $session): array
    {
        $data = validator($input, ['payment_method' => ['required', 'in:bank_transfer,cod'], 'items' => ['required', 'array', 'min:1', 'max:100'], 'items.*.product_id' => ['required', 'integer', 'distinct'], 'items.*.quantity' => ['required', 'integer', 'between:1,100000']])->validate();

        return DB::transaction(function () use ($data, $session) {
            $snapshot = $this->snapshot($data['items'], $data['payment_method']);
            if ($snapshot['requires_quote'] ?? false) {
                return $snapshot;
            }
            $preview = SalesCheckoutPreview::create(['id' => (string) Str::uuid(), 'session_hash' => hash('sha256', $session), 'fingerprint' => hash('sha256', json_encode($snapshot)), 'payment_method' => $data['payment_method'], 'items' => $data['items'], 'snapshot' => $snapshot, 'expires_at' => now()->addMinutes(config('sales.preview_lifetime_minutes', 15))]);

            return ['preview_id' => $preview->id, 'expires_at' => $preview->expires_at->toIso8601String(), ...$snapshot];
        });
    }

    public function confirm(array $input, string $session): array
    {
        $data = validator($input, ['preview_id' => ['required', 'uuid'], 'submission_key' => ['required', 'uuid'], 'name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'], 'phone' => ['required', 'string', 'regex:/^[+\d][\d\s()\-]{7,29}$/'], 'city' => ['required', 'string', 'max:255'], 'address' => ['required', 'string', 'max:2000'], 'company' => ['nullable', 'string', 'max:255'], 'customer_type' => ['required', 'in:individual,business,dealer,installer'], 'message' => ['nullable', 'string', 'max:5000'], 'consent' => ['required', 'accepted'], 'confirmed' => ['required', 'accepted']])->validate();
        $owner = hash('sha256', $session);
        $payload = hash('sha256', json_encode($data));

        return DB::transaction(function () use ($data, $owner, $payload) {
            $preview = SalesCheckoutPreview::whereKey($data['preview_id'])->lockForUpdate()->first();
            if (! $preview || ! hash_equals($preview->session_hash, $owner)) {
                throw ValidationException::withMessages(['preview_id' => 'Review checkout again in the same browser before confirming.']);
            }
            $existing = SalesRequest::where('checkout_preview_id', $preview->id)->orWhere('submission_key', $data['submission_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals($existing->session_hash, $owner) || ! hash_equals($existing->payload_hash, $payload) || $existing->checkout_preview_id !== $preview->id) {
                    throw ValidationException::withMessages(['submission_key' => 'This checkout reference was already used.']);
                }

                return $this->receipt($existing);
            }
            if ($preview->expires_at->isPast()) {
                throw ValidationException::withMessages(['preview_id' => 'Checkout totals expired. Review a fresh total before confirming.']);
            }
            $snapshot = $this->snapshot($preview->items, $preview->payment_method);
            if (! hash_equals($preview->fingerprint, hash('sha256', json_encode($snapshot)))) {
                throw ValidationException::withMessages(['preview_id' => 'Prices, tax, shipping or payment instructions changed. Review updated checkout details before confirming.']);
            }
            $snapshot['customer'] = Arr::only($data, ['name', 'email', 'phone', 'city', 'address', 'company', 'customer_type']);
            $order = SalesRequest::create(Arr::only($data, ['name', 'email', 'phone', 'city', 'address', 'company', 'customer_type', 'message']) + ['number' => 'ORD-'.Str::ulid(), 'source' => 'checkout', 'request_kind' => 'checkout', 'checkout_preview_id' => $preview->id, 'submission_key' => $data['submission_key'], 'session_hash' => $owner, 'payload_hash' => $payload, 'currency' => 'PKR', 'status' => 'new', 'payment_method' => $preview->payment_method, 'payment_status' => $preview->payment_method === 'bank_transfer' ? 'awaiting_verification' : 'awaiting_collection', 'consented_at' => now(), 'checkout_snapshot' => $snapshot]);
            foreach ($snapshot['pricing']['lines'] as $line) {
                $product = Product::findOrFail($line['product_id']);
                $order->items()->create(['product_id' => $product->id, 'name' => $line['name'], 'quantity' => $line['quantity'], 'category' => $product->primaryCategory?->name, 'unit_price_cents' => $line['unit_price_cents']]);
            }
            app(SalesWorkflow::class)->log($order, null, 'order_placed', ['payment_method' => $order->payment_method, 'payment_status' => $order->payment_status], 'Guest checkout order recorded. No payment verified or collected by the website.');

            return $this->receipt($order->fresh());
        });
    }

    private function receipt(SalesRequest $order): array
    {
        return ['success' => true, 'reference' => $order->number, 'request_kind' => 'checkout', 'payment_method' => $order->payment_method, 'payment_status' => $order->payment_method === 'bank_transfer' ? 'awaiting_verification' : 'awaiting_collection', 'checkout' => $order->checkout_snapshot, 'message' => 'Order recorded. Bank transfers and COD are handled outside the website. Placing this order does not verify payment.'];
    }
}
