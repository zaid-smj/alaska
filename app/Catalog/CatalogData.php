<?php

namespace App\Catalog;

use App\Models\Product;
use Illuminate\Support\Facades\Storage;

/** Internal retrieval contract for the future frontend; no HTTP endpoint. */
class CatalogData
{
    public static function forProduct(Product $product): array
    {
        $relation = match ($product->type) {
            'lead-acid' => 'leadAcidSpecifications', 'inverter' => 'inverterSpecifications', 'lithium-ion' => 'lithiumSpecifications'
        };
        $product->loadMissing(['series', 'primaryCategory', 'catalogTags', 'galleryImages', 'documents', $relation]);
        $groups = ['main' => [], 'secondary' => []];
        foreach (SpecificationFields::shared($product->type) as $key => $field) {
            $groups[$field['classification']][$key] = self::field($product, $field, $product->$key);
        }
        foreach (SpecificationFields::for($product->type) as $key => $field) {
            $groups[$field['classification']][$key] = self::field($product, $field, $product->$relation?->$key);
        }
        $documents = [];
        foreach (ProductFamily::from($product->type)->documentSlots() as $slot => $label) {
            $document = $product->documents->firstWhere('slot', $slot);
            $documents[$slot] = ['label' => $label, 'is_visible' => $document?->is_visible ?? true, 'is_available' => $document?->is_available ?? false, 'url' => $document?->is_available ? $document->url : null];
        }

        return [
            'id' => $product->id, 'family' => $product->type, 'name' => $product->name, 'slug' => $product->slug, 'status' => $product->status,
            'technology' => $product->technology, 'series' => $product->series?->only(['id', 'name']), 'category' => $product->primaryCategory?->only(['id', 'name']), 'tags' => $product->catalogTags->map->only(['id', 'name'])->values()->all(),
            'main_image' => ['url' => $product->image_url, 'alt_text' => $product->alt_text], 'gallery' => $product->galleryImages->map(fn ($image) => ['url' => Storage::disk('public')->url($image->path), 'alt_text' => $image->alt_text, 'sort_order' => $image->sort_order])->all(),
            'description' => $product->description, 'price_pkr' => $product->price_pkr, 'sort_order' => $product->sort_order,
            'features' => $product->features ?? [], 'recommended_uses' => $product->recommended_uses ?? [], 'warranty_details' => $product->warranty_details ?? [], 'installation_instructions' => $product->installation_instructions ?? [],
            'certifications' => ['value' => $product->certifications, 'is_visible' => $product->certifications_visible],
            'specifications' => $groups, 'visibility' => $product->specification_visibility ?? [], 'documents' => $documents,
        ];
    }

    private static function field(Product $product, array $definition, mixed $value): array
    {
        return ['label' => $definition['label'], 'value' => $value, 'unit' => $definition['unit'], 'visibility_group' => $definition['toggle'], 'is_visible' => $definition['toggle'] ? $product->isSpecificationVisible($definition['toggle']) : true];
    }
}
