<?php

namespace App\Models\Warranty;

use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WarrantyRegistration extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['identity_hash', 'session_hash', 'payload_hash', 'submission_key'];

    protected function casts(): array
    {
        return ['purchase_date' => 'date', 'registered_at' => 'datetime', 'confirmed_at' => 'datetime', 'consented_at' => 'datetime', 'form_snapshot' => 'array'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(WarrantyClaim::class);
    }

    public function uploads(): HasMany
    {
        return $this->hasMany(WarrantyUpload::class);
    }
}
