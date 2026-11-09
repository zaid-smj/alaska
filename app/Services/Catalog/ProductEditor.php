<?php

namespace App\Services\Catalog;

use App\Catalog\ProductFamily;
use App\Catalog\SpecificationFields;
use App\Models\Catalog\LithiumSpecification;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductTag;
use App\Models\Product;
use App\Services\AuditLogger;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductEditor
{
    public function save(Product $product, array $data, string $family): Product
    {
        ProductFamily::from($family);

        return DB::transaction(function () use ($product, $data, $family) {
            if ($product->exists && $product->type !== $family) {
                throw ValidationException::withMessages(['type' => 'This product belongs to another family.']);
            }
            $status = $data['status'] ?? $product->status ?? 'draft';
            $fields = ['name', 'slug', 'technology', 'series_id', 'primary_category_id', 'image', 'alt_text', 'price_pkr', 'description', 'sort_order', 'short_warranty_months', 'certifications', 'certifications_visible', 'specification_visibility', 'plates', 'voltage', 'capacity_ah', 'box_size', 'warranty', 'weight_kg', 'length', 'width', 'height', 'dimension_unit'];
            if ($family !== 'lead-acid') {
                $fields = array_diff($fields, ['plates', 'voltage', 'capacity_ah', 'box_size', 'warranty', 'weight_kg', 'length', 'width', 'height', 'dimension_unit']);
            }
            $product->fill(Arr::only($data, $fields));
            $product->type = $family;
            if (! $product->exists) {
                $product->status = 'draft';
                $product->save();
            }
            foreach (['features', 'recommended_uses', 'warranty_details', 'installation_instructions'] as $key) {
                if (array_key_exists($key, $data)) {
                    $product->$key = array_values(array_map(fn ($item) => is_array($item) ? trim($item['text'] ?? '') : trim($item), $data[$key] ?? []));
                    $product->$key = array_values(array_filter($product->$key, fn ($text) => $text !== ''));
                }
            }
            if (array_key_exists('recommended_uses', $data)) {
                // Preserve the old public accessor while exposing the new ordered list.
                $product->uses = implode("\n", $product->recommended_uses ?? []);
            }
            if (array_key_exists('tag_ids', $data)) {
                $ids = array_values(array_unique($data['tag_ids'] ?? []));
                $tags = ProductTag::where('family', $family)->whereIn('id', $ids)->get();
                if ($tags->count() !== count($ids)) {
                    throw ValidationException::withMessages(['tag_ids' => 'Select tags from this family only.']);
                }
                $product->catalogTags()->sync($ids);
                $product->tags = $tags->pluck('name')->all();
            }
            if ($product->primary_category_id) {
                $category = ProductCategory::whereKey($product->primary_category_id)->where('family', $family)->first();
                if (! $category) {
                    throw ValidationException::withMessages(['primary_category_id' => 'Choose a category from this family.']);
                }
                if ($family === 'lead-acid' && ! $category->legacy_section_id) {
                    $category->save();
                }
                if ($family === 'lead-acid' && $category->legacy_section_id) {
                    // Selecting a primary category never discards historical memberships.
                    $product->sections()->syncWithoutDetaching([$category->legacy_section_id]);
                }
            }
            if ($family === 'lead-acid' && isset($data['sections'])) {
                $sectionIds = ProductCategory::where('family', $family)->whereIn('legacy_section_id', $data['sections'])->pluck('legacy_section_id');
                if ($sectionIds->count() !== count(array_unique($data['sections']))) {
                    throw ValidationException::withMessages(['sections' => 'Choose valid historical Lead Acid sections.']);
                }
                $product->sections()->syncWithoutDetaching($sectionIds);
            }
            if ($family === 'lithium-ion' && array_key_exists('energy_value', $data['specs'] ?? [])) {
                try {
                    $data['specs']['nominal_energy_wh'] = LithiumSpecification::normalizeEnergy($data['specs']['energy_value'], $data['specs']['energy_unit'] ?? null);
                } catch (ValidationException $exception) {
                    throw ValidationException::withMessages(['specs.energy_value' => $exception->getMessage()]);
                }
            }
            $product->status = $status;
            $specModel = SpecificationFields::model($family);
            if (class_exists($specModel)) {
                $spec = $specModel::firstOrNew(['product_id' => $product->id]);
                $spec->fill(Arr::only($data['specs'] ?? [], array_keys(SpecificationFields::for($family))));
                // Stage the child row inside this transaction; final parent save
                // validates the complete aggregate and rolls everything back on failure.
                $stagingOwner = clone $product;
                $stagingOwner->status = 'draft';
                $spec->setRelation('product', $stagingOwner);
                try {
                    $spec->save();
                } catch (ValidationException $exception) {
                    throw ValidationException::withMessages(collect($exception->errors())->mapWithKeys(fn ($messages, $key) => ['specs.'.$key => $messages])->all());
                }
            }
            if (array_key_exists('gallery', $data)) {
                $kept = [];
                foreach (array_values($data['gallery'] ?? []) as $order => $row) {
                    if (isset($row['id']) && ! $product->galleryImages()->whereKey($row['id'])->exists()) {
                        throw ValidationException::withMessages(['gallery' => 'This image belongs to another product.']);
                    }
                    $image = $product->galleryImages()->updateOrCreate(['id' => $row['id'] ?? null], ['path' => $row['path'], 'alt_text' => $row['alt_text'] ?? null, 'sort_order' => $order]);
                    $kept[] = $image->id;
                }
                foreach ($product->galleryImages()->whereNotIn('id', $kept)->get() as $image) {
                    $image->delete();
                }
            }
            foreach (ProductFamily::from($family)->documentSlots() as $slot => $label) {
                $attributes = Arr::only($data['documents'][$slot] ?? [], ['path', 'is_visible']);
                try {
                    $product->documents()->updateOrCreate(['slot' => $slot], $attributes);
                } catch (ValidationException $exception) {
                    throw ValidationException::withMessages(collect($exception->errors())->mapWithKeys(fn ($messages, $key) => ['documents.'.$slot.'.'.$key => $messages])->all());
                }
            }
            $product->status = $status;
            $product->save();
            app(AuditLogger::class)->record('content.catalog.product.sections.saved', 'Product classifications and specifications were saved.', $product, ['family' => $family, 'series_id' => $product->series_id, 'primary_category_id' => $product->primary_category_id, 'section_ids' => $product->sections()->pluck('product_sections.id')->all()]);

            return $product->unsetRelations();
        });
    }

    public function formData(Product $product): array
    {
        $data = $product->attributesToArray();
        $model = SpecificationFields::model($product->type);
        $data['specs'] = class_exists($model) ? ($model::where('product_id', $product->id)->first()?->attributesToArray() ?? []) : [];
        if ($product->type === 'lithium-ion') {
            $energy = $product->lithiumSpecifications;
            $data['specs']['energy_unit'] = $energy?->energy_unit ?? 'Wh';
            $data['specs']['energy_value'] = $energy?->energyIn($data['specs']['energy_unit']);
        }
        $data['tag_ids'] = $product->catalogTags()->pluck('product_tags.id')->all();
        $data['sections'] = $product->sections()->pluck('product_sections.id')->all();
        $data['gallery'] = $product->galleryImages()->get()->map->only(['id', 'path', 'alt_text'])->all();
        $data['documents'] = $product->documents()->get()->keyBy('slot')->map->only(['path', 'is_visible'])->all();
        foreach (['features', 'recommended_uses', 'warranty_details', 'installation_instructions'] as $key) {
            $values = $product->$key ?? ($key === 'recommended_uses' && filled($product->uses) ? [$product->uses] : []);
            $data[$key] = array_map(fn ($text) => ['text' => $text], $values);
        }

        return $data;
    }
}
