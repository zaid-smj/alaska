<?php

namespace App\Models\Catalog;

use App\Models\Product;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductSeries extends Classification
{
    protected $table = 'product_series';

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'series_id');
    }
}
