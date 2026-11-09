<?php

namespace App\Models\Warranty;

use Illuminate\Database\Eloquent\Model;

class WarrantyUpload extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $hidden = ['path', 'session_hash'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'extracted_fields' => 'array'];
    }
}
