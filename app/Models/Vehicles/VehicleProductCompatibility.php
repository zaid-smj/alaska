<?php

namespace App\Models\Vehicles;

use App\Models\Product;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Validation\ValidationException;

class VehicleProductCompatibility extends Pivot
{
    protected $table = 'vehicle_product_compatibilities';

    public $timestamps = false;

    protected static function booted(): void
    {
        static::saving(function (self $compatibility) {
            if (Product::whereKey($compatibility->product_id)->value('type') !== 'lead-acid') {
                throw ValidationException::withMessages(['products' => 'Vehicle compatibility can only reference Lead Acid products.']);
            }
        });
    }
}
