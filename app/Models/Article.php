<?php

namespace App\Models;

use App\Services\AuditLogger;
use App\Services\Catalog\MediaFiles;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class Article extends Model
{
    protected $attributes = ['status' => 'draft', 'sort_order' => 0];

    protected $fillable = ['title', 'card_title', 'category', 'image', 'mobile_image', 'alt_text', 'body', 'status', 'sort_order', 'published_at'];

    public const STATUSES = ['draft' => 'Draft', 'published' => 'Published', 'hidden' => 'Hidden'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer', 'published_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::saving(function (self $article) {
            if (! $article->exists) {
                $base = Str::limit(Str::slug($article->title), 180, '') ?: 'article';
                $slug = $base;
                $number = 2;
                while (self::where('slug', $slug)->exists()) {
                    $slug = $base.'-'.$number++;
                }
                $article->slug = $slug;
            } elseif ($article->isDirty('slug') || $article->isDirty('legacy_image') || $article->isDirty('legacy_mobile_image')) {
                throw ValidationException::withMessages(['slug' => 'Original article identifiers and bundled image paths cannot be changed.']);
            }
            $required = $article->status === 'published' ? 'required' : 'nullable';
            validator($article->getAttributes(), [
                'title' => ['required', 'string', 'max:255'], 'card_title' => ['nullable', 'string', 'max:255'],
                'category' => [$required, 'string', 'max:255'], 'alt_text' => ['nullable', 'string', 'max:255'],
                'body' => [$required, 'string', 'max:500000'], 'status' => ['required', Rule::in(array_keys(self::STATUSES))],
                'sort_order' => ['required', 'integer', 'min:0', 'max:4294967295'], 'published_at' => ['nullable', 'date'],
            ])->validate();
            foreach (['image', 'mobile_image'] as $field) {
                if ($article->isDirty($field)) {
                    MediaFiles::validate($article->$field);
                }
            }
            if ($article->status === 'published') {
                if (blank($article->image) && blank($article->legacy_image)) {
                    throw ValidationException::withMessages(['image' => 'Add an article image before publishing.']);
                }
                if (trim(html_entity_decode(strip_tags($article->safe_body))) === '') {
                    throw ValidationException::withMessages(['body' => 'Add article text before publishing.']);
                }
                $article->published_at ??= now();
            }
        });
        foreach (['created', 'updated', 'deleted'] as $event) {
            static::{$event}(function (self $article) use ($event) {
                app(AuditLogger::class)->record('content.article.'.$event, "Article '{$article->title}' was {$event}.", $article, ['fields' => array_keys($article->getChanges())]);
                if ($event === 'created') {
                    return;
                }
                foreach (['image', 'mobile_image'] as $field) {
                    if ($event === 'deleted' || $article->wasChanged($field)) {
                        MediaFiles::removeAfterCommit($event === 'deleted' ? $article->$field : $article->getRawOriginal($field));
                    }
                }
            });
        }
    }

    public function save(array $options = []): bool
    {
        return DB::transaction(fn () => parent::save($options));
    }

    public function delete()
    {
        return DB::transaction(fn () => parent::delete());
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now())->orderBy('sort_order')->orderBy('id');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : ($this->legacy_image ? asset($this->legacy_image) : null);
    }

    public function getMobileImageUrlAttribute(): ?string
    {
        return $this->mobile_image ? Storage::disk('public')->url($this->mobile_image) : ($this->image ? $this->image_url : ($this->legacy_mobile_image ? asset($this->legacy_mobile_image) : $this->image_url));
    }

    public function getSafeBodyAttribute(): string
    {
        return Str::sanitizeHtml($this->body ?? '');
    }

    public function publicData(): array
    {
        return ['id' => $this->slug, 'title' => $this->card_title ?: $this->title, 'detailTitle' => $this->title, 'category' => $this->category, 'img' => $this->image_url, 'mobileImg' => $this->mobile_image_url, 'alt' => $this->alt_text ?: $this->title, 'content' => $this->safe_body];
    }
}
