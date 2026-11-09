<?php

namespace App\Models\Vehicles;

use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VehicleModel extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'vehicle_make_id');
    }

    public function fitments(): HasMany
    {
        return $this->hasMany(VehicleFitment::class);
    }

    protected static function booted(): void
    {
        static::saving(fn (self $model) => validator($model->getAttributes(), [
            'vehicle_make_id' => ['required', 'exists:vehicle_makes,id'], 'name' => ['required', 'string', 'max:255', Rule::unique('vehicle_models')->where('vehicle_make_id', $model->vehicle_make_id)->ignore($model->id)],
        ])->validate());
        static::deleting(function (self $model) {
            if ($model->fitments()->exists()) {
                throw ValidationException::withMessages(['name' => 'Remove or reassign the year ranges first.']);
            }
        });
    }
}
