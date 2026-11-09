<?php

namespace App\Models;

use App\Models\Concerns\AuditsCatalogChanges;
use App\Services\Catalog\MediaFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class NavbarImage extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    public const SLOTS = [
        'solutions' => ['Solutions dropdown', '/assets/solutions/automotive.webp'],
        'technology' => ['Technology dropdown', '/assets/technology/tech-1.webp'],
        'partners' => ['Partners dropdown', '/assets/Dealer-locator-banner.webp'],
        'warranty' => ['Warranty dropdown', '/assets/support2.webp'],
        'info' => ['Info dropdown', '/assets/vault/news.webp'],
        'about' => ['About dropdown', '/assets/mgmt.webp'],
        'graphite-light' => ['Graphite logo — light mode', '/assets/technology/tech.png'],
        'graphite-dark' => ['Graphite logo — dark mode', '/assets/tech-inv.png'],
        'calcium-light' => ['Calcium Silver logo — light mode', '/assets/calcium_silver_logo.png'],
        'calcium-dark' => ['Calcium Silver logo — dark mode', '/assets/calcium_silver_logo-inv.png'],
        'lifepo4-light' => ['LiFePO4 logo — light mode', '/assets/brand/lifepo4-logo.png'],
        'lifepo4-dark' => ['LiFePO4 logo — dark mode', '/assets/brand/lifepo4-logo-inv.png'],
        'brand-light' => ['Main logo — light mode', '/assets/brand/alaska-logo.png'],
        'brand-dark' => ['Main logo — dark mode', '/assets/brand/alaska-logo-inv.png'],
    ];

    protected static function booted(): void
    {
        static::saving(function (self $record) {
            if (! isset(self::SLOTS[$record->slot]) || ($record->exists && $record->isDirty('slot'))) {
                throw ValidationException::withMessages(['slot' => 'Navbar image positions cannot be changed.']);
            }
            if ($record->isDirty('image')) {
                MediaFiles::validate($record->image);
            }
        });
        static::updated(function (self $record) {
            if ($record->wasChanged('image')) {
                MediaFiles::removeAfterCommit($record->getRawOriginal('image'));
            }
        });
    }

    public function save(array $options = []): bool
    {
        return DB::transaction(fn () => parent::save($options));
    }

    public function getImageUrlAttribute(): string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : asset(ltrim(self::SLOTS[$this->slot][1], '/'));
    }

    public function getNameAttribute(): string
    {
        return self::SLOTS[$this->slot][0];
    }

    public static function forNavigation(): array
    {
        return self::all()->mapWithKeys(fn ($image) => [$image->slot => ['url' => $image->image_url, 'alt' => $image->alt_text]])->all();
    }
}
