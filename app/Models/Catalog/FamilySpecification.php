<?php

namespace App\Models\Catalog;

use App\Catalog\SpecificationFields;
use App\Models\Product;
use App\Services\Catalog\PublicationValidator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

abstract class FamilySpecification extends Model
{
    protected $guarded = ['id'];

    abstract public static function family(): string;

    protected function casts(): array
    {
        $casts = [];
        foreach (SpecificationFields::for(static::family()) as $field => $definition) {
            if ($definition['kind'] !== 'text' && $definition['kind'] !== 'select') {
                $casts[$field] = $definition['kind'] === 'integer' ? 'integer' : 'decimal:4';
            }
        }

        return $casts;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (FamilySpecification $specification) {
            if ($specification->product?->status === 'published' && ! $specification->product?->legacy_publication_exempt) {
                throw ValidationException::withMessages(['specs' => 'Hide or draft the product before removing its specifications.']);
            }
        });
        static::saving(function (FamilySpecification $specification) {
            foreach (SpecificationFields::for(static::family()) as $key => $definition) {
                if (($specification->getAttributes()[$key] ?? null) === '') {
                    $specification->setAttribute($key, null);
                }
            }
            $product = $specification->product;
            if (! $product || $product->type !== static::family()) {
                throw ValidationException::withMessages(['product_id' => 'Specifications must belong to the matching product family.']);
            }
            app(PublicationValidator::class)->validateSpecifications($specification->getAttributes(), static::family(), $product->status === 'published' && ! $product->legacy_publication_exempt);
        });
    }
}
