<?php

namespace App\Services\Sales;

use App\Enums\AdminRole;
use App\Models\Product;
use App\Models\Sales\SalesAttachment;
use App\Models\Sales\SalesRequest;
use App\Models\User;
use App\Sales\Money;
use App\Sales\SalesAccess;
use App\Services\AuditLogger;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SalesWorkflow
{
    public function submit(array $input, string $session): array
    {
        $data = validator($input, [
            'upload_id' => ['nullable', 'uuid'], 'submission_key' => ['required', 'uuid'], 'source' => ['required', 'in:cart,quote'], 'name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'], 'phone' => ['required', 'string', 'regex:/^[+\d][\d\s()\-]{7,29}$/'], 'city' => ['required', 'string', 'max:255'], 'company' => ['nullable', 'string', 'max:255'], 'customer_type' => ['required', 'in:individual,business,dealer,installer'], 'address' => ['nullable', 'string', 'max:2000'], 'message' => ['nullable', 'string', 'max:5000'], 'applications' => ['nullable', 'array', 'max:20'], 'applications.*' => ['string', 'max:100'], 'consent' => ['required', 'accepted'], 'confirmed' => ['required', 'accepted'],
            'items' => ['required', 'array', 'min:1', 'max:100'], 'items.*.name' => ['required', 'string', 'max:255'], 'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'], 'items.*.note' => ['nullable', 'string', 'max:1000'],
        ])->validate();
        if ($data['source'] === 'cart') {
            throw ValidationException::withMessages(['source' => 'Use the checkout preview and confirmation endpoints to review the server-calculated total. No order or payment was placed by this legacy cart submission.']);
        }
        $hash = hash('sha256', json_encode($data));
        $owner = hash('sha256', $session);

        return DB::transaction(function () use ($data, $hash, $owner) {
            $existing = SalesRequest::where('submission_key', $data['submission_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals($existing->session_hash, $owner) || ! hash_equals($existing->payload_hash, $hash)) {
                    throw ValidationException::withMessages(['submission_key' => 'This submission key was already used. Reload the form.']);
                }

                return $this->receipt($existing);
            }
            $attachment = null;
            if (! empty($data['upload_id'])) {
                $attachment = SalesAttachment::whereKey($data['upload_id'])->lockForUpdate()->first();
                if (! $attachment || ! hash_equals($attachment->session_hash, $owner) || $attachment->expires_at->isPast() || $attachment->sales_request_id) {
                    throw ValidationException::withMessages(['upload_id' => 'Upload the purchase order again before submitting.']);
                }
            }
            $lines = [];
            $estimate = 0;
            $unknown = false;
            foreach ($data['items'] as $line) {
                // Never trust a browser price, database ID from a static catalogue, or a claimed dealer discount.
                $matches = Product::forPublicUse()->where('name', $line['name'])->with('primaryCategory')->get();
                $product = $matches->count() === 1 ? $matches->first() : null;
                $price = $product?->price_pkr !== null ? Money::cents($product->price_pkr) : null;
                $lines[] = ['product_id' => $product?->id, 'name' => $product?->name ?? $line['name'], 'category' => $product?->primaryCategory?->name, 'quantity' => $line['quantity'], 'unit_price_cents' => $price, 'note' => $line['note'] ?? null];
                if ($price === null) {
                    $unknown = true;
                } else {
                    $lineTotal = $price * $line['quantity'];
                    if ($lineTotal > 100000000000000 - $estimate) {
                        $unknown = true;
                    } else {
                        $estimate += $lineTotal;
                    }
                }
            }
            $record = SalesRequest::create(Arr::only($data, ['source', 'name', 'email', 'phone', 'city', 'company', 'customer_type', 'address', 'message', 'applications']) + ['number' => 'SR-'.Str::ulid(), 'submission_key' => $data['submission_key'], 'session_hash' => $owner, 'payload_hash' => $hash, 'request_kind' => 'quote', 'status' => 'new', 'currency' => 'PKR', 'estimate_cents' => $unknown ? null : $estimate, 'consented_at' => now()]);
            $record->items()->createMany($lines);
            if ($attachment) {
                $attachment->update(['sales_request_id' => $record->id]);
            }
            $this->log($record, null, 'submitted', [], 'Website enquiry received. Not an order confirmation or payment.');

            return $this->receipt($record);
        });
    }

    private function receipt(SalesRequest $record): array
    {
        return ['success' => true, 'reference' => $record->number, 'message' => 'Your request has been saved. Our sales team will contact you to confirm pricing and arrangements. No payment has been collected.'];
    }

    public function log(SalesRequest $record, ?User $actor, string $event, array $changes = [], ?string $note = null): void
    {
        $record->activities()->create(['actor_id' => $actor?->id, 'event' => $event, 'changes' => $changes, 'note' => $note]);
        app(AuditLogger::class)->record('sales.'.$event, 'Sales request '.$record->number.' '.$event.'.', $record, ['changes' => $changes], actor: $actor);
    }

    public function review(SalesRequest $request, User $actor, array $input): void
    {
        abort_unless(SalesAccess::allows($actor), 403);
        $data = validator($input, ['status' => ['required', Rule::in(array_keys(SalesRequest::STATUSES))], 'follow_up_at' => ['nullable', 'date'], 'external_reference' => ['nullable', 'string', 'max:255'], 'note' => ['nullable', 'string', 'max:5000'], 'tracking_reference' => ['nullable', 'string', 'max:255']])->validate();
        DB::transaction(function () use ($request, $actor, $data) {
            $record = SalesRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();
            if ($data['status'] !== $record->status && blank($data['note'] ?? null)) {
                throw ValidationException::withMessages(['note' => 'Record the reason or external outcome when changing status.']);
            }
            if ($data['status'] !== $record->status && $record->request_kind === 'checkout' && $record->payment_method === 'bank_transfer' && in_array($data['status'], ['processing', 'ready_for_dispatch', 'shipped', 'delivered', 'completed'], true) && $record->payment_status !== 'bank_transfer_verified') {
                throw ValidationException::withMessages(['status' => 'Record the external bank-transfer verification before fulfilment.']);
            }
            $changes = [];
            foreach (['status', 'tracking_reference', 'external_reference', 'follow_up_at'] as $field) {
                if (! array_key_exists($field, $data)) {
                    continue;
                }
                $value = $data[$field];
                if ((string) $record->$field !== (string) $value) {
                    $changes[$field] = ['from' => $record->$field, 'to' => $value];
                    $record->$field = $value;
                }
            }
            $record->completed_at = $record->status === 'completed' ? ($record->completed_at ?? now()) : null;
            $record->save();
            $this->log($record, $actor, 'reviewed', $changes, $data['note'] ?? null);
        });
    }

    public function claim(SalesRequest $request, User $actor): void
    {
        abort_unless(SalesAccess::allows($actor), 403);
        DB::transaction(function () use ($request, $actor) {
            $record = SalesRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();
            if ($record->assigned_to === $actor->id) {
                return;
            }
            if ($record->assigned_to !== null) {
                throw ValidationException::withMessages(['claim' => 'This request is already claimed by another colleague. Use Transfer to change its owner.']);
            }
            $record->update(['assigned_to' => $actor->id, 'claimed_at' => now(), 'status' => $record->status === 'new' ? 'assigned' : $record->status]);
            $this->log($record, $actor, 'claimed', ['assigned_to' => ['from' => null, 'to' => $actor->id]]);
        });
    }

    public function transfer(SalesRequest $request, User $actor, array $input): void
    {
        abort_unless(SalesAccess::allows($actor), 403);
        $data = validator($input, ['assigned_to' => ['required', 'integer', 'exists:users,id'], 'expected_assigned_to' => ['nullable', 'integer'], 'note' => ['required', 'string', 'max:5000']])->validate();
        DB::transaction(function () use ($request, $actor, $data) {
            $record = SalesRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();
            if (! in_array($actor->role, [AdminRole::SuperAdmin, AdminRole::Admin], true) && (string) $record->assigned_to !== (string) ($data['expected_assigned_to'] ?? null)) {
                throw ValidationException::withMessages(['assigned_to' => 'Ownership changed since you opened this form. Refresh before transferring.']);
            }
            $target = User::whereKey($data['assigned_to'])->sharedLock()->first();
            if (! SalesAccess::allows($target)) {
                throw ValidationException::withMessages(['assigned_to' => 'Choose an active sales-authorized colleague.']);
            }
            $previous = $record->assigned_to;
            $record->update(['assigned_to' => $target->id, 'claimed_at' => now(), 'status' => $record->status === 'new' ? 'assigned' : $record->status]);
            $this->log($record, $actor, 'transferred', ['assigned_to' => ['from' => $previous, 'to' => $target->id]], $data['note']);
        });
    }

    public function addNote(SalesRequest $request, User $actor, string $note): void
    {
        abort_unless(SalesAccess::allows($actor), 403);
        $data = validator(['note' => $note], ['note' => ['required', 'string', 'max:5000']])->validate();
        DB::transaction(function () use ($request, $actor, $data) {
            $record = SalesRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();
            $this->log($record, $actor, 'note_added', [], $data['note']);
        });
    }

    public function paymentOutcome(SalesRequest $request, User $actor, array $input): void
    {
        abort_unless(SalesAccess::allows($actor), 403);
        $data = validator($input, ['payment_status' => ['required', 'string'], 'reference' => ['required', 'string', 'max:255'], 'note' => ['required', 'string', 'max:5000']])->validate();
        DB::transaction(function () use ($request, $actor, $data) {
            $record = SalesRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();
            $allowed = match ($record->payment_method) {
                'bank_transfer' => ['awaiting_verification', 'bank_transfer_verified', 'verification_failed'],'cod' => ['awaiting_collection', 'cod_collected', 'collection_failed'],default => []
            };
            if ($record->request_kind !== 'checkout' || ! in_array($data['payment_status'], $allowed, true)) {
                throw ValidationException::withMessages(['payment_status' => 'Choose an outcome for this checkout payment method.']);
            }
            $before = $record->only(['payment_status', 'payment_status_recorded_by', 'payment_status_recorded_at', 'payment_status_reference']);
            $record->update(['payment_status' => $data['payment_status'], 'payment_status_recorded_by' => $actor->id, 'payment_status_recorded_at' => now(), 'payment_status_reference' => $data['reference']]);
            $this->log($record, $actor, 'payment_outcome_recorded', ['from' => $before, 'to' => $record->only(array_keys($before))], $data['note']);
        });
    }
}
