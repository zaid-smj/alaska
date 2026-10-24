<?php

namespace App\Models;

use App\Models\Concerns\AuditsCatalogChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class ProductSection extends Model
{
    use AuditsCatalogChanges;

    protected $guarded = ['id'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

    public function delete()
    {
        return DB::transaction(function () {
            // Even products shared with another section must be reviewed before republishing.
            foreach ($this->products()->get() as $product) {
                $product->update(['status' => 'draft']);
            }

            return parent::delete();
        });
    }
}
