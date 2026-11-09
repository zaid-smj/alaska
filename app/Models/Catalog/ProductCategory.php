<?php

namespace App\Models\Catalog;

use App\Models\Product;
use App\Models\ProductSection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class ProductCategory extends Classification
{
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'primary_category_id');
    }

    public function legacySection(): BelongsTo
    {
        return $this->belongsTo(ProductSection::class, 'legacy_section_id');
    }

    protected function hasPublishedDependents(): bool
    {
        return parent::hasPublishedDependents() || ($this->family === 'lead-acid' && $this->legacy_section_id && Product::where('type', 'lead-acid')->where('status', 'published')->whereHas('sections', fn ($query) => $query->where('product_sections.id', $this->legacy_section_id))->exists());
    }

    protected function hasDependents(): bool
    {
        return parent::hasDependents() || ($this->legacy_section_id && DB::table('product_product_section')->where('product_section_id', $this->legacy_section_id)->exists());
    }

    protected static function booted(): void
    {
        parent::booted();
        static::saving(function (ProductCategory $category) {
            if ($category->family === 'lead-acid') {
                $section = ($category->legacy_section_id ? ProductSection::find($category->legacy_section_id) : null) ?? ProductSection::firstOrNew(['name' => $category->name]);
                $section->fill(['name' => $category->name, 'description' => $category->description, 'sort_order' => $category->sort_order ?? 0])->save();
                $category->legacy_section_id = $section->id;
                $category->setRelation('legacySection', $section);
            }
        });
    }
}
