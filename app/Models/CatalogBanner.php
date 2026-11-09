<?php

namespace App\Models;

use App\Catalog\ProductFamily;
use App\Models\Concerns\AuditsCatalogChanges;
use App\Services\Catalog\MediaFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CatalogBanner extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::saving(function (CatalogBanner $banner) {
            $banner->family ??= 'lead-acid';
            if (! ProductFamily::tryFrom($banner->family) || ($banner->exists && $banner->isDirty('family'))) {
                throw ValidationException::withMessages(['family' => 'A banner cannot move between product families.']);
            }
            foreach (['image', 'mobile_image'] as $field) {
                if ($banner->isDirty($field)) {
                    MediaFiles::validate($banner->$field);
                }
            }
        });
        static::updated(function (CatalogBanner $banner): void {
            foreach (['image', 'mobile_image'] as $field) {
                if ($banner->wasChanged($field) && $banner->getRawOriginal($field)) {
                    MediaFiles::removeAfterCommit($banner->getRawOriginal($field));
                }
            }
        });
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : (($this->family ?? 'lead-acid') === 'lead-acid' ? url('assets/solutions/solutions-hero.webp') : null);
    }

    public function getMobileImageUrlAttribute(): ?string
    {
        return $this->mobile_image ? Storage::disk('public')->url($this->mobile_image) : ($this->image ? $this->image_url : (($this->family ?? 'lead-acid') === 'lead-acid' ? url('assets/solutions/mobile/solutions-hero-mobile.webp') : null));
    }
}
