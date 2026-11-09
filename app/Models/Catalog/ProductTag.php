<?php

namespace App\Models\Catalog;

use App\Models\Product;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductTag extends Classification
{
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_tag_assignments')->using(ProductTagAssignment::class);
    }

    protected static function booted(): void
    {
        parent::booted();
        static::updated(function (ProductTag $tag) {
            if ($tag->wasChanged('name')) {
                foreach ($tag->products()->get() as $product) {
                    $product->update(['tags' => $product->catalogTags()->pluck('name')->all()]);
                }
            }
        });
    }
}
