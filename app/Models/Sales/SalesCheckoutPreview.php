<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class SalesCheckoutPreview extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $hidden = ['session_hash', 'fingerprint'];

    protected function casts(): array
    {
        return ['items' => 'array', 'snapshot' => 'array', 'expires_at' => 'datetime'];
    }

    public function order()
    {
        return $this->hasOne(SalesRequest::class, 'checkout_preview_id');
    }
}
