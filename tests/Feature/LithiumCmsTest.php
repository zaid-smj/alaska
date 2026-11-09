<?php

namespace Tests\Feature;

use App\Catalog\SpecificationFields;
use App\Filament\Resources\LithiumProducts\Pages\CreateProduct;
use App\Filament\Resources\LithiumProducts\Pages\EditProduct;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductSeries;
use App\Models\Catalog\ProductTag;
use App\Models\Product;
use App\Models\User;
use App\Services\Catalog\ProductEditor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class LithiumCmsTest extends TestCase
{
    use RefreshDatabase;

    private function data(): array
    {
        $specs = [];
        foreach (SpecificationFields::for('lithium-ion') as $name => $definition) {
            if (! $definition['required']) {
                continue;
            }
            $specs[$name] = match ($definition['kind']) {
                'text' => 'Synthetic test value', 'integer' => 2, 'select' => array_key_first($definition['options']), default => 20
            };
        }
        $specs = array_replace($specs, ['energy_value' => '5.12', 'energy_unit' => 'kWh', 'charging_temp_min_c' => -10, 'charging_temp_max_c' => 50, 'discharging_temp_min_c' => -20, 'discharging_temp_max_c' => 60, 'storage_temp_min_c' => -20, 'storage_temp_max_c' => 45, 'depth_of_discharge_percent' => 80, 'cycle_life_cycles' => 6000, 'self_discharge_percent' => 3, 'self_discharge_period' => 'per month', 'operating_humidity' => '5–95% non-condensing']);
        unset($specs['nominal_energy_wh']);

        return [
            'name' => 'Test lithium', 'technology' => 'LiFePO₄', 'status' => 'published',
            'series_id' => ProductSeries::where('family', 'lithium-ion')->value('id'), 'primary_category_id' => ProductCategory::where('family', 'lithium-ion')->value('id'), 'tag_ids' => [ProductTag::where('family', 'lithium-ion')->value('id')],
            'image' => UploadedFile::fake()->image('lithium.png')->store('content/products', 'public'), 'alt_text' => 'Lithium', 'sort_order' => 0,
            'features' => [['text' => 'Verified test feature']], 'recommended_uses' => [['text' => 'Custom free-text use']], 'warranty_details' => [['text' => 'Test terms']], 'installation_instructions' => [['text' => 'Actual model instructions required']], 'certifications' => 'Test certification', 'specs' => $specs,
        ];
    }

    public function test_lithium_form_crud_normalizes_energy_and_preserves_optional_values_and_toggles(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create());
        $data = $this->data();
        $data['image'] = UploadedFile::fake()->image('lithium.png');
        $data['specification_visibility'] = ['nominal_energy' => false, 'cycle_life' => false];
        $data['specs']['cycle_life_conditions'] = '@80% DOD, 25°C';
        $data['specs']['bluetooth'] = 'not_specified';
        Livewire::test(CreateProduct::class)->fillForm($data)->call('create')->assertHasNoFormErrors();
        $product = Product::where('type', 'lithium-ion')->firstOrFail();
        $spec = $product->lithiumSpecifications;
        $this->assertSame('5120.0000', $spec->nominal_energy_wh);
        $this->assertSame('5.1200000', $spec->energyIn('kWh'));
        $this->assertSame('-10.0000', $spec->charging_temp_min_c);
        $this->assertSame('@80% DOD, 25°C', $spec->cycle_life_conditions);
        $this->assertSame('per month', $spec->self_discharge_period);
        $this->assertSame('5–95% non-condensing', $spec->operating_humidity);
        $this->assertNull($spec->wifi);
        $this->assertSame('not_specified', $spec->bluetooth);
        $this->assertFalse($product->isSpecificationVisible('nominal_energy'));
        Livewire::test(EditProduct::class, ['record' => $product->id])->fillForm(['name' => 'Renamed lithium'])->call('save')->assertHasNoFormErrors();
        $this->assertSame('5120.0000', $product->fresh()->lithiumSpecifications->nominal_energy_wh);
        $this->assertFalse($product->fresh()->isSpecificationVisible('nominal_energy'));
        $this->assertCount(4, $product->documents);
    }

    public function test_invalid_temperature_range_and_unpaired_extra_dimensions_are_rejected(): void
    {
        Storage::fake('public');
        $data = $this->data();
        $data['specs']['charging_temp_min_c'] = 70;
        try {
            app(ProductEditor::class)->save(new Product, $data, 'lithium-ion');
            $this->fail('Invalid temperature range accepted.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('specs.charging_temp_max_c', $e->errors());
        }
        $data = $this->data();
        $data['specs']['extra_dimension_label'] = 'Bracket depth';
        $this->expectException(ValidationException::class);
        app(ProductEditor::class)->save(new Product, $data, 'lithium-ion');
    }

    public function test_out_of_range_dod_and_missing_required_values_cannot_be_hidden_by_toggles(): void
    {
        Storage::fake('public');
        $data = $this->data();
        $data['specs']['depth_of_discharge_percent'] = 101;
        $data['specification_visibility'] = ['depth_of_discharge' => false];
        $this->expectException(ValidationException::class);
        app(ProductEditor::class)->save(new Product, $data, 'lithium-ion');
    }

    public function test_wh_conversion_is_exact_and_invalid_voltage_range_is_rejected(): void
    {
        Storage::fake('public');
        $data = $this->data();
        $data['specs']['energy_value'] = '1234.5678';
        $data['specs']['energy_unit'] = 'Wh';
        $product = app(ProductEditor::class)->save(new Product, $data, 'lithium-ion');
        $this->assertSame('1.2345678', $product->lithiumSpecifications->energyIn('kWh'));
        $this->assertNull($product->lithiumSpecifications->pulse_duration_s);
        $this->assertNull($product->lithiumSpecifications->cycle_life_conditions);
        $this->expectException(ValidationException::class);
        app(ProductEditor::class)->save($product, ['specs' => ['charge_voltage_min_v' => 60, 'charge_voltage_max_v' => 40]], 'lithium-ion');
    }
}
