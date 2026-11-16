<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class SalesAttachment extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $hidden = ['path', 'session_hash'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }
}
