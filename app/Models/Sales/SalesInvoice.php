<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class SalesInvoice extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['customer_snapshot' => 'array', 'lines' => 'array', 'discount_snapshot' => 'array', 'issued_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::updating(fn () => throw ValidationException::withMessages(['invoice' => 'Issued invoices are immutable. Record a refund or adjustment separately.']));
        static::deleting(fn () => throw ValidationException::withMessages(['invoice' => 'Issued invoices must be retained.']));
    }

    public function request()
    {
        return $this->belongsTo(SalesRequest::class, 'sales_request_id');
    }

    public function payments()
    {
        return $this->hasMany(SalesPayment::class);
    }

    public function getNetPaidCentsAttribute(): int
    {
        return (int) $this->payments()->where('kind', 'receipt')->sum('amount_cents') - (int) $this->payments()->where('kind', 'refund')->sum('amount_cents');
    }
}
