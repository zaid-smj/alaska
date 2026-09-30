<?php

namespace App\Models;

use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class HomeBannerSlide extends Model
{
    protected $fillable = [
        'kicker',
        'title',
        'subtitle',
        'desktop_image',
        'mobile_image',
        'legacy_desktop_path',
        'legacy_mobile_path',
        'alt_text',
        'primary_button_label',
        'primary_button_url',
        'secondary_button_label',
        'secondary_button_url',
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
        static::created(function (HomeBannerSlide $slide): void {
            app(AuditLogger::class)->record(
                'content.banner.created',
                "Home page banner slide '{$slide->title}' was created.",
                $slide,
            );
        });

        static::updated(function (HomeBannerSlide $slide): void {
            self::deleteReplacedUploads($slide);

            $changes = self::auditableChanges($slide);

            if ($changes !== []) {
                app(AuditLogger::class)->record(
                    'content.banner.updated',
                    "Home page banner slide '{$slide->title}' was updated.",
                    $slide,
                    ['changes' => $changes],
                );
            }
        });

        static::deleted(function (HomeBannerSlide $slide): void {
            self::deleteUpload($slide->desktop_image);
            self::deleteUpload($slide->mobile_image);

            app(AuditLogger::class)->record(
                'content.banner.deleted',
                "Home page banner slide '{$slide->title}' was deleted.",
                $slide,
            );
        });
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }

    protected function desktopImageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->imageUrl($this->desktop_image, $this->legacy_desktop_path));
    }

    protected function mobileImageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->imageUrl($this->mobile_image, $this->legacy_mobile_path));
    }

    private function imageUrl(?string $upload, ?string $legacyPath): ?string
    {
        if ($upload) {
            return Storage::disk('public')->url($upload);
        }

        return $legacyPath ? url($legacyPath) : null;
    }

    private static function deleteReplacedUploads(HomeBannerSlide $slide): void
    {
        foreach (['desktop_image', 'mobile_image'] as $field) {
            if ($slide->wasChanged($field)) {
                self::deleteUpload($slide->getRawOriginal($field));
            }
        }
    }

    private static function deleteUpload(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }

    /** @return array<string, array{from: mixed, to: mixed}> */
    private static function auditableChanges(HomeBannerSlide $slide): array
    {
        return collect($slide->getChanges())
            ->except('updated_at')
            ->mapWithKeys(fn (mixed $value, string $field): array => [$field => [
                'from' => $slide->getRawOriginal($field),
                'to' => $value,
            ]])
            ->all();
    }
}
