<?php

namespace App\Models\Catalog;

use App\Catalog\ProductFamily;
use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

abstract class Classification extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    public function save(array $options = [])
    {
        return DB::transaction(function () use ($options) {
            if ($this->exists) {
                static::whereKey($this->id)->lockForUpdate()->firstOrFail();
            }

            return parent::save($options);
        });
    }

    public function delete()
    {
        return DB::transaction(function () {
            if ($this->exists) {
                static::whereKey($this->id)->lockForUpdate()->firstOrFail();
            }

            return parent::delete();
        });
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    protected function hasPublishedDependents(): bool
    {
        return $this->products()->where('status', 'published')->exists();
    }

    protected function hasDependents(): bool
    {
        return $this->products()->exists();
    }

    protected static function booted(): void
    {
        static::saving(function (Classification $record) {
            if (! ProductFamily::tryFrom($record->family ?? '')) {
                throw ValidationException::withMessages(['family' => 'Choose a valid product family.']);
            }
            if ($record->exists && $record->isDirty('family')) {
                throw ValidationException::withMessages(['family' => 'A classification cannot move to a different family.']);
            }
            validator($record->getAttributes(), ['name' => ['required', 'string', 'max:255'], 'is_active' => ['sometimes', 'boolean'], 'sort_order' => ['sometimes', 'integer', 'min:0']])->validate();
            if (static::where('family', $record->family)->where('name', $record->name)->whereKeyNot($record->id ?? 0)->exists()) {
                throw ValidationException::withMessages(['name' => 'This name already exists in this family.']);
            }
            if ($record->exists && $record->isDirty('is_active') && ! $record->is_active && $record->hasPublishedDependents()) {
                throw ValidationException::withMessages(['is_active' => 'Reassign or hide the published products before deactivating this classification.']);
            }
        });
        static::deleting(function (Classification $record) {
            if ($record->hasDependents()) {
                throw ValidationException::withMessages(['name' => 'This classification is in use. Reassign products before removal, or deactivate it once no published products depend on it.']);
            }
        });
    }
}
