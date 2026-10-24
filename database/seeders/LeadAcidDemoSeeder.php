<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductSection;
use Illuminate\Database\Seeder;

class LeadAcidDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            throw new \RuntimeException('Demo products can only be loaded in local or testing environments.');
        }

        // Deliberately opt-in, never part of DatabaseSeeder or the production migration.
        $samples = [
            ['slug' => 'a-55l', 'name' => 'A 55L', 'section' => 'Dry Charge', 'plates' => 7, 'capacity_ah' => 32, 'warranty' => '6 Months', 'box_size' => 'NS-40', 'weight_kg' => 6.54, 'length' => 7.72, 'width' => 5.08, 'height' => 7.95, 'legacy_image_path' => 'assets/batteries/automotive/a55.png', 'tags' => ['Automotive'], 'uses' => 'Small Hatchbacks, Generators'],
            ['slug' => 'dc-1100', 'name' => 'DC 1100', 'section' => 'Deep Cycle', 'plates' => 11, 'capacity_ah' => 80, 'warranty' => '9 Months', 'box_size' => 'N-70', 'weight_kg' => 13.85, 'length' => 11.65, 'width' => 6.61, 'height' => 7.95, 'legacy_image_path' => 'assets/batteries/deep-cycle/dc1100.png', 'tags' => ['Backup'], 'uses' => 'UPS Backup, Solar Inverters'],
            ['slug' => 'mf-50', 'name' => 'MF 50', 'section' => 'Maintenance Free', 'plates' => 5, 'capacity_ah' => 22, 'warranty' => 'None', 'legacy_image_path' => 'assets/batteries/mf/mf-50.png', 'tags' => ['Automotive'], 'uses' => '660cc - 1000cc Vehicles'],
        ];
        foreach ($samples as $order => $sample) {
            $section = $sample['section'];
            unset($sample['section']);
            if (Product::where('slug', $sample['slug'])->exists()) {
                continue; // Never overwrite admin edits when rerun.
            }
            $product = Product::create($sample + ['voltage' => 12, 'dimension_unit' => 'in', 'alt_text' => $sample['name'].' battery', 'status' => 'published', 'description' => 'Recommended for '.$sample['uses'].'.', 'sort_order' => $order + 1]);
            $product->sections()->attach(ProductSection::where('name', $section)->firstOrFail());
        }
    }
}
