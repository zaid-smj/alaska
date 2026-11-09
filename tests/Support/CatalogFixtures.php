<?php

namespace Tests\Support;

use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductSeries;
use App\Models\Catalog\ProductTag;
use App\Models\Product;
use App\Models\ProductSection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

trait CatalogFixtures
{
    /** Simulate a record grandfathered by the migration, not a new publication. */
    protected function legacyProduct(array $attributes = [], ?ProductSection $section = null): Product
    {
        $status = $attributes['status'] ?? 'published';
        unset($attributes['status']);
        $product = Product::create($attributes + ['name' => 'Legacy battery', 'type' => 'lead-acid', 'status' => 'draft', 'alt_text' => 'Battery', 'legacy_image_path' => 'assets/batteries/automotive/a55.png', 'plates' => 7, 'voltage' => 12, 'capacity_ah' => 32, 'tags' => ['Automotive'], 'uses' => 'Small hatchbacks']);
        $product->sections()->attach($section ?? ProductSection::firstOrFail());
        DB::table('products')->where('id', $product->id)->update(['status' => $status, 'legacy_publication_exempt' => $product->type === 'lead-acid' && $status === 'published']);

        return $product->fresh();
    }

    protected function completeLeadAcidData(array $overrides = []): array
    {
        $family = 'lead-acid';

        return array_replace_recursive([
            'name' => 'Complete battery', 'technology' => 'German Engineering', 'status' => 'published',
            'series_id' => ProductSeries::where('family', $family)->value('id'),
            'primary_category_id' => ProductCategory::where('family', $family)->value('id'),
            'tag_ids' => [ProductTag::where('family', $family)->value('id')],
            'image' => UploadedFile::fake()->image('battery.png')->store('content/products', 'public'), 'alt_text' => 'Battery photograph',
            'price_pkr' => null, 'sort_order' => 0, 'plates' => 7, 'voltage' => 12, 'capacity_ah' => 42, 'box_size' => 'NS-40',
            'features' => [['text' => 'Verified test feature']], 'recommended_uses' => [['text' => 'Test use']],
            'warranty_details' => [['text' => 'Test warranty']], 'installation_instructions' => [['text' => 'Test installation']],
            'certifications' => 'Test certification',
            'specs' => ['cca' => 'Test CCA', 'reserve_capacity' => 'Test RC', 'terminal_type' => 'Test terminal', 'terminal_layout' => 'L', 'depth_mm' => 200, 'width_mm' => 130, 'height_mm' => 200, 'true_height_mm' => 220, 'dry_weight_kg' => 7.25],
        ], $overrides);
    }
}
