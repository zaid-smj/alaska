<?php

namespace App\Models\Catalog;

use App\Models\Product;
use App\Services\Catalog\MediaFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductGalleryImage extends Model
{
    protected $guarded = ['id'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function booted(): void
    {
        static::saving(function (self $image) {
            validator($image->getAttributes(), ['path' => ['required', 'string', 'max:255'], 'alt_text' => ['nullable', 'string', 'max:255'], 'sort_order' => ['nullable', 'integer', 'min:0']])->validate();
            MediaFiles::validate($image->path);
        });
        static::updated(function (self $image) {
            if ($image->wasChanged('path')) {
                MediaFiles::removeAfterCommit($image->getRawOriginal('path'));
            }
        });
        static::deleted(fn (self $image) => MediaFiles::removeAfterCommit($image->path));
    }
}
