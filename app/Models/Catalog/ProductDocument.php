<?php

namespace App\Models\Catalog;

use App\Catalog\ProductFamily;
use App\Models\Product;
use App\Services\Catalog\MediaFiles;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductDocument extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->whereNotNull('path')->where('path', '!=', '')->where('is_visible', true);
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->is_visible && filled($this->path) && Storage::disk('public')->exists($this->path);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->path ? Storage::disk('public')->url($this->path) : null;
    }

    protected static function booted(): void
    {
        static::saving(function (self $document) {
            validator($document->getAttributes(), ['path' => ['nullable', 'string', 'max:255'], 'is_visible' => ['sometimes', 'boolean']])->validate();
            if (! array_key_exists($document->slot, ProductFamily::from($document->product->type)->documentSlots())) {
                throw ValidationException::withMessages(['slot' => 'This document slot does not belong to this family.']);
            }
            MediaFiles::validate($document->path, true);
        });
        static::updated(function (self $document) {
            if ($document->wasChanged('path')) {
                MediaFiles::removeAfterCommit($document->getRawOriginal('path'));
            }
        });
        static::deleted(fn (self $document) => MediaFiles::removeAfterCommit($document->path));
    }
}
