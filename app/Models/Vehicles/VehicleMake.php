<?php

namespace App\Models\Vehicles;

use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VehicleMake extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function models(): HasMany
    {
        return $this->hasMany(VehicleModel::class);
    }

    protected static function booted(): void
    {
        static::saving(fn (self $make) => validator($make->getAttributes(), ['name' => ['required', 'string', 'max:255', Rule::unique('vehicle_makes')->ignore($make->id)]])->validate());
        static::deleting(function (self $make) {
            if ($make->models()->exists()) {
                throw ValidationException::withMessages(['name' => 'Remove or reassign the vehicle models first.']);
            }
        });
    }
}
