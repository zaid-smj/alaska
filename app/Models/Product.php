<?php

namespace App\Models;

use App\Catalog\ProductFamily;
use App\Models\Catalog\InverterSpecification;
use App\Models\Catalog\LeadAcidSpecification;
use App\Models\Catalog\LithiumSpecification;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductDocument;
use App\Models\Catalog\ProductGalleryImage;
use App\Models\Catalog\ProductSeries;
use App\Models\Catalog\ProductTag;
use App\Models\Catalog\ProductTagAssignment;
use App\Models\Concerns\AuditsCatalogChanges;
use App\Models\Vehicles\VehicleFitment;
use App\Models\Vehicles\VehicleProductCompatibility;
use App\Services\Catalog\MediaFiles;
use App\Services\Catalog\PublicationValidator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class Product extends Model
{
    use AuditsCatalogChanges;

    public const TAGS = ['Automotive' => 'Automotive', 'Backup' => 'Backup', 'Industrial' => 'Industrial'];

    protected $guarded = ['id', 'legacy_publication_exempt'];

    protected function casts(): array
    {
        return ['features' => 'array', 'recommended_uses' => 'array', 'warranty_details' => 'array', 'installation_instructions' => 'array', 'specification_visibility' => 'array', 'certifications_visible' => 'boolean', 'legacy_publication_exempt' => 'boolean', 'short_warranty_months' => 'integer', 'tags' => 'array', 'plates' => 'integer', 'sort_order' => 'integer', 'price_pkr' => 'decimal:2'];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product): void {
            foreach (['price_pkr', 'short_warranty_months', 'plates', 'voltage', 'capacity_ah', 'weight_kg', 'length', 'width', 'height', 'series_id', 'primary_category_id'] as $field) {
                if (($product->getAttributes()[$field] ?? null) === '') {
                    $product->$field = null;
                }
            }
            if (blank($product->name)) {
                $product->name = null;
            }
            if ($product->exists && $product->isDirty('type')) {
                throw ValidationException::withMessages(['type' => 'Products cannot move between families.']);
            }
            if (! $product->exists) {
                $product->legacy_publication_exempt = false;
                $product->status ??= 'draft';
                $product->type ??= 'lead-acid';
                $product->sort_order ??= 0;
                $product->certifications_visible ??= true;
                if (! array_key_exists('technology', $product->getAttributes())) {
                    $product->technology = ProductFamily::tryFrom($product->type)?->technology();
                }
            } elseif ($product->isDirty('legacy_publication_exempt') && $product->legacy_publication_exempt) {
                throw ValidationException::withMessages(['status' => 'Legacy publication exemptions cannot be granted manually.']);
            }
            if ($product->status !== 'published') {
                $product->legacy_publication_exempt = false;
            }
            $exempt = $product->exists && $product->type === 'lead-acid'
                && $product->getRawOriginal('legacy_publication_exempt')
                && $product->getRawOriginal('status') === 'published' && $product->status === 'published';
            if ($product->isDirty('image') && $product->image) {
                MediaFiles::validate($product->image);
            }
            app(PublicationValidator::class)->validate($product, $product->status === 'published' && ! $exempt);

            if (blank($product->slug)) {
                $base = Str::slug($product->name) ?: 'battery';
                $slug = $base;
                $suffix = 2;
                while (static::where('slug', $slug)->whereKeyNot($product->getKey() ?? 0)->exists()) {
                    $slug = $base.'-'.$suffix++;
                }
                $product->slug = $slug;
            }
        });
        static::updated(function (Product $product): void {
            if ($product->wasChanged('image') && $product->getRawOriginal('image')) {
                MediaFiles::removeAfterCommit($product->getRawOriginal('image'));
            }
        });
        static::created(function (Product $product): void {
            foreach (ProductFamily::from($product->type)->documentSlots() as $slot => $label) {
                $product->documents()->firstOrCreate(['slot' => $slot]);
            }
        });
        static::deleting(function (Product $product): void {
            foreach ($product->galleryImages()->get() as $image) {
                $image->delete();
            }
            foreach ($product->documents()->get() as $document) {
                $document->delete();
            }
        });
        static::deleted(function (Product $product): void {
            if ($product->image) {
                MediaFiles::removeAfterCommit($product->image);
            }
        });
    }

    public function sections(): BelongsToMany
    {
        return $this->belongsToMany(ProductSection::class);
    }

    public function save(array $options = [])
    {
        return DB::transaction(fn () => parent::save($options));
    }

    public function delete()
    {
        return DB::transaction(fn () => parent::delete());
    }

    public function series(): BelongsTo
    {
        return $this->belongsTo(ProductSeries::class, 'series_id');
    }

    public function primaryCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'primary_category_id');
    }

    public function catalogTags(): BelongsToMany
    {
        return $this->belongsToMany(ProductTag::class, 'product_tag_assignments')->using(ProductTagAssignment::class);
    }

    public function galleryImages(): HasMany
    {
        return $this->hasMany(ProductGalleryImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProductDocument::class);
    }

    public function leadAcidSpecifications(): HasOne
    {
        return $this->hasOne(LeadAcidSpecification::class);
    }

    public function inverterSpecifications(): HasOne
    {
        return $this->hasOne(InverterSpecification::class);
    }

    public function lithiumSpecifications(): HasOne
    {
        return $this->hasOne(LithiumSpecification::class);
    }

    public function vehicleFitments(): BelongsToMany
    {
        return $this->belongsToMany(VehicleFitment::class, 'vehicle_product_compatibilities')->using(VehicleProductCompatibility::class);
    }

    public function scopeForFamily(Builder $query, string $family): Builder
    {
        return $query->where('type', $family);
    }

    public function scopeForPublicUse(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function isSpecificationVisible(string $key): bool
    {
        return (bool) ($this->specification_visibility[$key] ?? true);
    }

    public function publicationIssues(): array
    {
        try {
            app(PublicationValidator::class)->validate($this, true);

            return [];
        } catch (ValidationException $exception) {
            return $exception->errors();
        }
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('type', 'lead-acid')->where('status', 'published')->whereHas('sections');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : ($this->legacy_image_path ? url($this->legacy_image_path) : null);
    }

    public function specifications(): array
    {
        $number = fn ($value): string => rtrim(rtrim(number_format((float) $value, 3, '.', ''), '0'), '.');
        $withUnit = fn ($value, $unit): string => $value === null ? '—' : $number($value).' '.$unit;
        $dimensions = collect([$this->length, $this->width, $this->height]);

        return [
            'Name' => $this->name,
            'Plates' => $this->plates === null ? '—' : (string) $this->plates,
            'Voltage' => $withUnit($this->voltage, 'V'),
            'Capacity (Ah)' => $withUnit($this->capacity_ah, 'Ah'),
            'Warranty' => $this->warranty ?: '—',
            'Weight' => $withUnit($this->weight_kg, 'kg'),
            'Box size' => $this->box_size ?: '—',
            'Dimensions' => $dimensions->contains(null) ? '—' : $dimensions->map($number)->implode(' × ').' '.$this->dimension_unit,
            'Tags' => implode(', ', $this->tags ?? []) ?: '—',
            'Uses' => $this->uses ?: '—',
        ];
    }

    public function searchText(): string
    {
        return mb_strtolower(implode(' ', $this->specifications()).' '.$this->description.' '.$this->price_pkr.' PKR');
    }

    public function matchesSearch(string $search): bool
    {
        // Accept compact units (12V, 32Ah) as well as spaced values.
        $search = preg_replace('/(?<=\d)(?=ah\b|v\b|kg\b|mm\b|cm\b|in\b)/i', ' ', $search);
        $haystack = $this->searchText();

        return collect(preg_split('/\s+/u', trim(mb_strtolower($search)), -1, PREG_SPLIT_NO_EMPTY))
            ->every(fn (string $term): bool => str_contains($haystack, $term));
    }
}
