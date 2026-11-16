<?php

namespace App\Models\Sales;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class SalesPayment extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['received_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        foreach (['updating', 'deleting'] as $event) {
            static::{$event}(fn () => throw ValidationException::withMessages(['payment' => 'Payment entries are append-only. Record a separate correction/refund.']));
        }
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
