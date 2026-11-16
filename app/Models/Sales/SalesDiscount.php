<?php

namespace App\Models\Sales;

use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class SalesDiscount extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    protected $attributes = ['minimum_cents' => 0, 'usage_count' => 0, 'is_active' => true];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'starts_at' => 'datetime', 'ends_at' => 'datetime', 'product_ids' => 'array', 'category_ids' => 'array', 'customer_types' => 'array'];
    }

    protected static function booted(): void
    {
        static::saving(function ($r) {
            $r->code = strtoupper(trim($r->code));
            validator($r->getAttributes(), ['code' => ['required', 'regex:/^[A-Z0-9_-]{1,60}$/'], 'type' => ['required', 'in:percentage,fixed'], 'value' => ['required', 'numeric', 'min:0', $r->type === 'percentage' ? 'max:100' : 'max:999999999'], 'minimum_cents' => ['integer', 'min:0'], 'maximum_cents' => ['nullable', 'integer', 'min:0'], 'usage_limit' => ['nullable', 'integer', 'min:1'], 'starts_at' => ['nullable', 'date'], 'ends_at' => ['nullable', 'date', Rule::when(filled($r->starts_at), 'after_or_equal:starts_at')]])->validate();
        });
    }

    public function getNameAttribute(): string
    {
        return $this->code;
    }

    public function getStateAttribute(): string
    {
        return ! $this->is_active ? 'Disabled' : ($this->ends_at?->isPast() ? 'Expired' : ($this->starts_at?->isFuture() ? 'Scheduled' : 'Active'));
    }
}
