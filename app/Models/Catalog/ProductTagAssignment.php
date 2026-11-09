<?php

namespace App\Models\Catalog;

use App\Models\Product;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Validation\ValidationException;

class ProductTagAssignment extends Pivot
{
    protected $table = 'product_tag_assignments';

    public $timestamps = false;

    protected static function booted(): void
    {
        static::saving(function (self $assignment) {
            if (Product::whereKey($assignment->product_id)->value('type') !== ProductTag::whereKey($assignment->product_tag_id)->value('family')) {
                throw ValidationException::withMessages(['tag_ids' => 'Tags and products must belong to the same family.']);
            }
        });
    }
}
