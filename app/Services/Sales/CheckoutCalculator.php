<?php

namespace App\Services\Sales;

use App\Models\Product;
use App\Models\Sales\SalesCheckoutSettings;
use App\Models\Sales\SalesTaxProfile;
use App\Sales\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutCalculator
{
    public function calculate(array $items, ?int $shippingCents = null): array
    {
        $items = validator(['items' => $items], ['items' => ['required', 'array', 'min:1', 'max:100'], 'items.*.product_id' => ['required', 'integer', 'distinct'], 'items.*.quantity' => ['required', 'integer', 'between:1,100000']])->validate()['items'];
        if (array_sum(array_column($items, 'quantity')) > config('sales.cart_unit_limit', 49)) {
            return ['requires_quote' => true, 'reason' => 'quantity_limit', 'unit_limit' => config('sales.cart_unit_limit', 49)];
        }
        $lines = [];
        $total = 0;
        $taxTotal = 0;
        $netTotal = 0;
        foreach ($items as $index => $item) {
            $product = Product::forPublicUse()->find($item['product_id']);
            if (! $product || $product->price_pkr === null) {
                throw ValidationException::withMessages(["items.$index" => 'This product is unavailable for checkout or has no price. Use Request a Quote.']);
            }
            $today = now(config('app.display_timezone'))->toDateString();
            $profileQuery = SalesTaxProfile::where('family', $product->type)->where('is_active', true)->whereNotNull('approved_at')->whereNotNull('approved_by')->whereDate('effective_from', '<=', $today)->where(fn ($q) => $q->whereNull('effective_until')->orWhereDate('effective_until', '>=', $today));
            if (DB::transactionLevel() > 0) {
                $profileQuery->sharedLock();
            }
            $profiles = $profileQuery->get();
            $specific = $profiles->filter(fn ($p) => $p->product_ids && in_array($product->id, $p->product_ids));
            $eligible = $specific->isNotEmpty() ? $specific : $profiles->filter(fn ($p) => ! $p->product_ids);
            if ($eligible->count() !== 1) {
                throw ValidationException::withMessages(['tax' => 'An unambiguous, accounts-confirmed tax profile is required for every checkout product.']);
            }
            $profile = $eligible->first();
            $listed = Money::cents($product->price_pkr) * $item['quantity'];
            $components = [['name' => $profile->name, 'rate_basis_points' => $profile->rate_basis_points], ...($profile->additional_taxes ?? [])];
            $rate = array_sum(array_column($components, 'rate_basis_points'));
            if ($profile->calculation_basis === 'retail_price') {
                if ($product->tax_retail_price_pkr === null) {
                    throw ValidationException::withMessages(['tax' => 'The confirmed printed retail-price tax basis is missing.']);
                }$base = Money::cents($product->tax_retail_price_pkr) * $item['quantity'];
            } else {
                $base = $profile->price_includes_tax ? intdiv($listed * 10000 + intdiv(10000 + $rate, 2), 10000 + $rate) : $listed;
            }
            $taxes = [];
            $tax = 0;
            foreach ($components as $component) {
                $amount = intdiv($base * $component['rate_basis_points'] + 5000, 10000);
                $tax += $amount;
                $taxes[] = $component + ['taxable_base_cents' => $base, 'amount_cents' => $amount];
            }
            if ($profile->price_includes_tax && $profile->calculation_basis === 'transaction_value') {
                // Allocate the included tax proportionally using largest remainders.
                // Components stay nonnegative and sum exactly to the listed gross minus net.
                $target = $listed - $base;
                $allocated = 0;
                $remainders = [];
                foreach ($taxes as $i => &$entry) {
                    $numerator = $target * $entry['rate_basis_points'];
                    $entry['amount_cents'] = $rate ? intdiv($numerator, $rate) : 0;
                    $allocated += $entry['amount_cents'];
                    $remainders[$i] = $rate ? $numerator % $rate : 0;
                }unset($entry);
                arsort($remainders);
                foreach (array_keys($remainders) as $i) {
                    if ($allocated >= $target) {
                        break;
                    }$taxes[$i]['amount_cents']++;
                    $allocated++;
                }
                $tax = $target;
            }
            $gross = $profile->price_includes_tax ? $listed : $listed + $tax;
            $net = $gross - $tax;
            if ($net < 0) {
                throw ValidationException::withMessages(['tax' => 'Tax exceeds the listed tax-inclusive price; confirm the price basis.']);
            }
            $lines[] = ['product_id' => $product->id, 'name' => $product->name, 'quantity' => $item['quantity'], 'unit_price_cents' => Money::cents($product->price_pkr), 'net_cents' => $net, 'tax_cents' => $tax, 'total_cents' => $gross, 'taxes' => $taxes, 'tax_profile' => ['id' => $profile->id, 'basis' => $profile->calculation_basis, 'price_includes_tax' => $profile->price_includes_tax, 'source_url' => $profile->source_url, 'approved_at' => $profile->approved_at->toIso8601String()]];
            $total += $gross;
            $netTotal += $net;
            $taxTotal += $tax;
        }
        if ($shippingCents !== null && ($shippingCents < 0 || $shippingCents > 100000000000000)) {
            throw ValidationException::withMessages(['shipping' => 'Shipping cannot be negative.']);
        }

        return ['requires_quote' => false, 'currency' => 'PKR', 'lines' => $lines, 'subtotal_excluding_tax_cents' => $netTotal, 'tax_cents' => $taxTotal, 'products_total_cents' => $total, 'shipping_cents' => $shippingCents, 'final_total_cents' => $shippingCents === null ? null : $total + $shippingCents, 'ready_for_confirmation' => $shippingCents !== null];
    }

    public function shippingTax(int $fee, ?int $profileId = null): array
    {
        if ($fee < 0 || $fee > 999999999999) {
            throw ValidationException::withMessages(['shipping' => 'Invalid configured shipping charge.']);
        }
        if ($fee === 0) {
            return ['base_cents' => 0, 'tax_cents' => 0, 'total_cents' => 0, 'taxes' => [], 'profile' => null];
        }
        $today = now(config('app.display_timezone'))->toDateString();
        $query = SalesTaxProfile::where('family', 'shipping')->where('is_active', true)->whereNotNull('approved_at')->whereNotNull('approved_by')->whereDate('effective_from', '<=', $today)->where(fn ($q) => $q->whereNull('effective_until')->orWhereDate('effective_until', '>=', $today));
        if ($profileId !== null) {
            $query->whereKey($profileId);
        }if (DB::transactionLevel() > 0) {
            $query->sharedLock();
        }$profiles = $query->get();
        if ($profiles->count() !== 1) {
            throw ValidationException::withMessages(['shipping_tax' => 'Configure an accounts-confirmed shipping tax treatment, including an explicit zero rate if applicable.']);
        }
        $profile = $profiles->first();
        $taxes = [];
        $tax = 0;
        foreach ([['name' => $profile->name, 'rate_basis_points' => $profile->rate_basis_points], ...($profile->additional_taxes ?? [])] as $component) {
            $amount = intdiv($fee * $component['rate_basis_points'] + 5000, 10000);
            $tax += $amount;
            $taxes[] = $component + ['taxable_base_cents' => $fee, 'amount_cents' => $amount];
        }

        return ['base_cents' => $fee, 'tax_cents' => $tax, 'total_cents' => $fee + $tax, 'taxes' => $taxes, 'profile' => ['id' => $profile->id, 'source_url' => $profile->source_url, 'approved_at' => $profile->approved_at->toIso8601String()]];
    }

    public function checkout(array $items, SalesCheckoutSettings $settings): array
    {
        $products = $this->calculate($items);
        if ($products['requires_quote']) {
            return $products;
        }
        $shipping = $this->shippingTax($settings->shipping_fee_cents, $settings->shipping_tax_profile_id);

        return array_replace($products, ['shipping_cents' => $shipping['base_cents'], 'shipping_tax_cents' => $shipping['tax_cents'], 'shipping' => $shipping, 'total_tax_cents' => $products['tax_cents'] + $shipping['tax_cents'], 'final_total_cents' => $products['products_total_cents'] + $shipping['total_cents'], 'ready_for_confirmation' => true]);
    }
}
