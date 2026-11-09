<?php

namespace App\Services\Catalog;

use App\Catalog\ProductFamily;
use App\Catalog\SpecificationFields;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductSeries;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PublicationValidator
{
    public function specificationRules(string $family, bool $required): array
    {
        $rules = [];
        foreach (SpecificationFields::for($family) as $key => $field) {
            $rules[$key] = $this->measurementRules($key, $field, $required);
        }

        return $rules;
    }

    public function measurementRules(string $key, array $field, bool $required): array
    {
        $rules = [$required && $field['required'] ? 'required' : 'nullable'];
        if ($field['kind'] === 'text') {
            return [...$rules, 'string', 'max:5000'];
        }
        if ($field['kind'] === 'select') {
            return [...$rules, Rule::in(array_keys($field['options']))];
        }
        $rules[] = $field['kind'] === 'integer' ? 'integer' : 'numeric';
        if ($field['kind'] === 'decimal') {
            $rules[] = in_array($key, ['voltage', 'capacity_ah'], true) ? 'decimal:0,2' : 'decimal:0,4';
        }
        $rules[] = $field['unit'] === '°C' ? 'min:-273.15' : (in_array($key, ['short_warranty_months', 'depth_of_discharge_percent', 'self_discharge_percent', 'max_altitude_m', 'internal_resistance_mohm'], true) ? 'min:0' : 'min:0.0001');
        $rules[] = in_array($key, ['depth_of_discharge_percent', 'self_discharge_percent'], true) ? 'max:100' : ($field['kind'] === 'integer' ? 'max:2147483647' : 'max:999999999999.9999');

        $limits = ['plates' => 65535, 'voltage' => 999999.99, 'capacity_ah' => 99999999.99];
        if (isset($limits[$key])) {
            $rules[] = 'max:'.$limits[$key];
        }

        return $rules;
    }

    public function validateSpecifications(array $data, string $family, bool $required): void
    {
        $validator = Validator::make($data, $this->specificationRules($family, $required));
        $validator->after(function ($validator) use ($data, $family) {
            foreach (SpecificationFields::ranges($family) as [$min, $max]) {
                if (isset($data[$min], $data[$max]) && is_numeric($data[$min]) && is_numeric($data[$max]) && $data[$min] > $data[$max]) {
                    $validator->errors()->add($max, 'The maximum must be greater than or equal to the minimum.');
                }
            }
            if ($family === 'lithium-ion' && (filled($data['extra_dimension_label'] ?? null) !== filled($data['extra_dimension_mm'] ?? null))) {
                $validator->errors()->add('extra_dimension_mm', 'Provide both the extra dimension label and its measurement.');
            }
        });
        $validator->validate();
    }

    public function validate(Product $product, bool $full): void
    {
        $family = ProductFamily::tryFrom($product->type ?? '');
        if (! $family) {
            throw ValidationException::withMessages(['type' => 'Choose a valid product family.']);
        }
        $required = $full ? 'required' : 'nullable';
        $rules = [
            'name' => [$required, 'string', 'max:255', Rule::unique('products')->where('type', $product->type)->ignore($product->id)],
            'status' => ['required', Rule::in(['draft', 'published', 'hidden'])],
            'technology' => [$required, 'string', 'max:255'],
            'series_id' => [$required, 'integer', Rule::exists('product_series', 'id')->where('family', $product->type)],
            'primary_category_id' => [$required, 'integer', Rule::exists('product_categories', 'id')->where('family', $product->type)],
            'price_pkr' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'description' => ['nullable', 'string', 'max:10000'],
            'alt_text' => [$required, 'string', 'max:255'],
            'certifications' => [$required, 'string', 'max:10000'],
            'certifications_visible' => ['boolean'],
            'specification_visibility' => ['nullable', 'array:'.implode(',', SpecificationFields::toggles($product->type))],
            'specification_visibility.*' => ['boolean'],
            'warranty' => ['nullable', 'string', 'max:255'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:9999999.999'],
            'length' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'width' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'height' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'dimension_unit' => ['nullable', Rule::in(['mm', 'cm', 'in'])],
        ];
        foreach (SpecificationFields::shared($product->type) as $key => $definition) {
            $rules[$key] = $this->measurementRules($key, $definition, $full);
        }
        foreach (['features', 'recommended_uses', 'warranty_details', 'installation_instructions'] as $key) {
            $rules[$key] = [$required, 'array', ...($full ? ['min:1'] : [])];
            $rules[$key.'.*'] = ['required', 'string', 'max:5000'];
        }
        $attributes = $product->getAttributes();
        foreach (['features', 'recommended_uses', 'warranty_details', 'installation_instructions', 'specification_visibility'] as $field) {
            $attributes[$field] = $product->$field;
        }
        $validator = Validator::make($attributes, $rules);
        $validator->after(function ($validator) use ($product, $family, $full) {
            foreach (['series_id' => ProductSeries::class, 'primary_category_id' => ProductCategory::class] as $key => $model) {
                if ($full && $product->$key && ! $model::whereKey($product->$key)->where('family', $family->value)->where('is_active', true)->sharedLock()->first()) {
                    $validator->errors()->add($key, 'Select an active classification in this family.');
                }
            }
            if (! $full) {
                return;
            }
            $hasMainImage = $product->image ? Storage::disk('public')->exists($product->image) : ($product->legacy_image_path && str_starts_with($product->legacy_image_path, 'assets/') && ! str_contains($product->legacy_image_path, '..') && is_file(public_path($product->legacy_image_path)));
            if (! $hasMainImage) {
                $validator->errors()->add('image', 'A main product image is required before publication.');
            }
            $tags = $product->catalogTags()->sharedLock()->get();
            if ($family !== ProductFamily::Inverter && $tags->isEmpty()) {
                $validator->errors()->add('tag_ids', 'Select at least one tag before publication.');
            }
            if ($tags->contains(fn ($tag) => $tag->family !== $family->value || ! $tag->is_active)) {
                $validator->errors()->add('tag_ids', 'All selected tags must be active and belong to this family.');
            }
            if ($family === ProductFamily::LeadAcid && ! $product->sections()->exists()) {
                $validator->errors()->add('sections', 'Lead Acid products must retain at least one catalog section.');
            }
        });
        $errors = $validator->errors()->messages();
        $specModel = SpecificationFields::model($product->type);
        // Family tables are introduced sequentially; only persisted specs are used.
        $spec = $product->exists && class_exists($specModel) ? $specModel::where('product_id', $product->id)->first() : null;
        try {
            $this->validateSpecifications($spec?->getAttributes() ?? [], $product->type, $full);
        } catch (ValidationException $exception) {
            foreach ($exception->errors() as $key => $messages) {
                $errors['specs.'.$key] = $messages;
            }
        }
        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }
}
