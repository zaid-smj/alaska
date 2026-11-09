<?php

namespace App\Models\Vehicles;

use App\Models\Concerns\AuditsCatalogChanges;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class VehicleFitment extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['year_from' => 'integer', 'year_to' => 'integer'];
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'vehicle_model_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'vehicle_product_compatibilities')->using(VehicleProductCompatibility::class);
    }

    protected static function booted(): void
    {
        static::saving(fn (self $fitment) => validator($fitment->getAttributes(), [
            'vehicle_model_id' => ['required', 'exists:vehicle_models,id'], 'year_from' => ['required', 'integer', 'between:1886,2200'], 'year_to' => ['required', 'integer', 'between:1886,2200', 'gte:year_from'], 'notes' => ['nullable', 'string', 'max:5000'],
        ])->validate());
    }
}
