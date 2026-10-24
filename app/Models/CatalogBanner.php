<?php

namespace App\Models;

use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CatalogBanner extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::updated(function (CatalogBanner $banner): void {
            foreach (['image', 'mobile_image'] as $field) {
                if ($banner->wasChanged($field) && $banner->getRawOriginal($field)) {
                    Storage::disk('public')->delete($banner->getRawOriginal($field));
                }
            }
        });
    }

    public function getImageUrlAttribute(): string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : url('assets/solutions/solutions-hero.webp');
    }

    public function getMobileImageUrlAttribute(): string
    {
        return $this->mobile_image ? Storage::disk('public')->url($this->mobile_image) : ($this->image ? $this->image_url : url('assets/solutions/mobile/solutions-hero-mobile.webp'));
    }
}
