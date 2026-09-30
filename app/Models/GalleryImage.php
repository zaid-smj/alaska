<?php

namespace App\Models;

use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class GalleryImage extends Model
{
    public const CATEGORIES = [
        'corporate' => 'Corporate',
        'dealer' => 'Partner',
        'awards' => 'Awards',
    ];

    protected $fillable = [
        'category',
        'image',
        'legacy_image_path',
        'alt_text',
        'caption',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (GalleryImage $image): void {
            app(AuditLogger::class)->record(
                'content.gallery.created',
                "Gallery image '{$image->alt_text}' was added.",
                $image,
                ['category' => $image->category],
            );
        });

        static::updated(function (GalleryImage $image): void {
            if ($image->wasChanged('image')) {
                self::deleteUpload($image->getRawOriginal('image'));
            }

            $changes = collect($image->getChanges())
                ->except('updated_at')
                ->mapWithKeys(fn (mixed $value, string $field): array => [$field => [
                    'from' => $image->getRawOriginal($field),
                    'to' => $value,
                ]])
                ->all();

            if ($changes !== []) {
                app(AuditLogger::class)->record(
                    'content.gallery.updated',
                    "Gallery image '{$image->alt_text}' was updated.",
                    $image,
                    ['changes' => $changes],
                );
            }
        });

        static::deleted(function (GalleryImage $image): void {
            self::deleteUpload($image->image);

            app(AuditLogger::class)->record(
                'content.gallery.deleted',
                "Gallery image '{$image->alt_text}' was removed.",
                $image,
                ['category' => $image->category],
            );
        });
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if ($this->image) {
                return Storage::disk('public')->url($this->image);
            }

            return $this->legacy_image_path ? url($this->legacy_image_path) : null;
        });
    }

    protected function categoryLabel(): Attribute
    {
        return Attribute::get(fn (): string => self::CATEGORIES[$this->category] ?? ucfirst($this->category));
    }

    private static function deleteUpload(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
