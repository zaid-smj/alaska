<?php

namespace App\Models\Sales;

use App\Catalog\ProductFamily;
use App\Enums\AdminRole;
use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SalesTaxProfile extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id', 'approved_by', 'approved_at'];

    protected $attributes = ['is_active' => false];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'price_includes_tax' => 'boolean', 'rate_basis_points' => 'integer', 'product_ids' => 'array', 'additional_taxes' => 'array', 'effective_from' => 'date', 'effective_until' => 'date', 'approved_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::saving(function (self $p) {
            validator(['name' => $p->name, 'family' => $p->family, 'calculation_basis' => $p->calculation_basis, 'rate_basis_points' => $p->rate_basis_points, 'price_includes_tax' => $p->price_includes_tax, 'applicability_notes' => $p->applicability_notes, 'source_url' => $p->source_url, 'effective_from' => $p->effective_from?->toDateString(), 'effective_until' => $p->effective_until?->toDateString(), 'additional_taxes' => $p->additional_taxes, 'product_ids' => $p->product_ids], [
                'name' => ['required', 'string', 'max:255'], 'family' => ['required', Rule::in([...array_column(ProductFamily::cases(), 'value'), 'shipping'])], 'calculation_basis' => ['required', 'in:transaction_value,retail_price'], 'rate_basis_points' => ['required', 'integer', 'between:0,10000'], 'price_includes_tax' => ['required', 'boolean'], 'applicability_notes' => ['required', 'string', 'max:2000'], 'source_url' => ['required', 'url:http,https', 'max:2048'], 'effective_from' => ['required', 'date'], 'effective_until' => ['nullable', 'date', 'after_or_equal:effective_from'], 'product_ids' => ['nullable', 'array'], 'product_ids.*' => ['integer', Rule::exists('products', 'id')->where('type', $p->family)], 'additional_taxes' => ['nullable', 'array', 'max:10'], 'additional_taxes.*.name' => ['required', 'string', 'max:100'], 'additional_taxes.*.rate_basis_points' => ['required', 'integer', 'between:0,10000'],
            ])->validate();
            if ($p->family === 'shipping' && ($p->calculation_basis !== 'transaction_value' || $p->price_includes_tax || ! empty($p->product_ids))) {
                throw ValidationException::withMessages(['family' => 'Shipping rules use the tax-exclusive shipping charge, not a product or printed retail-price basis.']);
            }
            if ($p->rate_basis_points + collect($p->additional_taxes)->sum('rate_basis_points') > 10000) {
                throw ValidationException::withMessages(['additional_taxes' => 'Combined rates must not exceed 100%.']);
            }
            if ($p->is_active && $p->isDirty()) {
                $actor = auth()->user();
                abort_unless($actor?->is_active && in_array($actor->role, [AdminRole::SuperAdmin, AdminRole::Admin], true), 403);
                $p->approved_by = $actor->id;
                $p->approved_at = now();
            }
        });
    }

    public function save(array $options = []): bool
    {
        return DB::transaction(fn () => parent::save($options));
    }
}
