<?php

namespace App\Models\Sales;

use App\Enums\AdminRole;
use App\Services\AuditLogger;
use App\Services\Sales\CheckoutCalculator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesCheckoutSettings extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['checkout_enabled' => 'boolean', 'bank_transfer_enabled' => 'boolean', 'cod_enabled' => 'boolean', 'shipping_fee_cents' => 'integer', 'bank_accounts' => 'array'];
    }

    public static function canManage(): bool
    {
        return auth()->user()?->is_active && in_array(auth()->user()?->role, [AdminRole::SuperAdmin, AdminRole::Admin], true);
    }

    protected static function booted(): void
    {
        static::saving(function ($s) {
            abort_unless(static::canManage(), 403);
            validator(['shipping_fee_cents' => $s->shipping_fee_cents, 'bank_accounts' => $s->bank_accounts, 'bank_transfer_instructions' => $s->bank_transfer_instructions, 'cod_instructions' => $s->cod_instructions], ['shipping_fee_cents' => ['required', 'integer', 'between:0,999999999999'], 'bank_accounts' => ['nullable', 'array', 'max:10'], 'bank_accounts.*.bank_name' => ['required', 'string', 'max:255'], 'bank_accounts.*.account_title' => ['required', 'string', 'max:255'], 'bank_accounts.*.account_number' => ['required', 'string', 'max:100'], 'bank_accounts.*.iban' => ['nullable', 'string', 'max:100'], 'bank_transfer_instructions' => ['nullable', 'string', 'max:5000'], 'cod_instructions' => ['nullable', 'string', 'max:5000']])->validate();
            if ($s->checkout_enabled) {
                if (! $s->bank_transfer_enabled && ! $s->cod_enabled) {
                    throw ValidationException::withMessages(['checkout_enabled' => 'Enable at least one payment route.']);
                }if ($s->bank_transfer_enabled && empty($s->bank_accounts)) {
                    throw ValidationException::withMessages(['bank_accounts' => 'Add bank payment details before enabling bank-transfer checkout.']);
                }if ($s->shipping_fee_cents > 0) {
                    app(CheckoutCalculator::class)->shippingTax($s->shipping_fee_cents, $s->shipping_tax_profile_id);
                }
            }
        });
        static::updated(function ($s) {
            $changes = [];
            foreach (array_keys($s->getChanges()) as $key) {
                if ($key !== 'updated_at') {
                    $changes[$key] = ['from' => $s->getRawOriginal($key), 'to' => $s->getAttribute($key)];
                }
            }app(AuditLogger::class)->record('sales.checkout_settings.updated', 'Checkout shipping/payment instructions updated.', $s, ['changes' => $changes]);
        });
    }

    public function save(array $options = []): bool
    {
        return DB::transaction(fn () => parent::save($options));
    }

    public function publicInstructions(string $method): array
    {
        return $method === 'bank_transfer' ? ['bank_accounts' => array_map(fn ($account) => Arr::only($account, ['bank_name', 'account_title', 'account_number', 'iban']), $this->bank_accounts ?? []), 'instructions' => $this->bank_transfer_instructions] : ['instructions' => $this->cod_instructions];
    }
}
