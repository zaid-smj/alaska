<?php

namespace App\Models;

use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    use AuditsCatalogChanges;

    public const TAGS = ['Automotive' => 'Automotive', 'Backup' => 'Backup', 'Industrial' => 'Industrial'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['tags' => 'array', 'plates' => 'integer', 'sort_order' => 'integer', 'price_pkr' => 'decimal:2'];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product): void {
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
                Storage::disk('public')->delete($product->getRawOriginal('image'));
            }
        });
        static::deleted(function (Product $product): void {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
        });
    }

    public function sections(): BelongsToMany
    {
        return $this->belongsToMany(ProductSection::class);
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
