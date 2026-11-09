<?php

namespace Tests\Feature;

use App\Filament\Resources\InverterProducts\Pages\CreateProduct;
use App\Filament\Resources\InverterProducts\Pages\EditProduct;
use App\Filament\Resources\InverterProducts\Pages\ListProducts;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductSeries;
use App\Models\Product;
use App\Models\User;
use App\Services\Catalog\ProductEditor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class InverterCmsTest extends TestCase
{
    use RefreshDatabase;

    private function data(): array
    {
        return [
            'name' => 'Test inverter', 'technology' => 'Dual Output Smart Inverters', 'status' => 'published',
            'series_id' => ProductSeries::where('family', 'inverter')->value('id'),
            'primary_category_id' => ProductCategory::where('family', 'inverter')->value('id'),
            'image' => UploadedFile::fake()->image('inverter.png')->store('content/products', 'public'), 'alt_text' => 'Inverter', 'sort_order' => 0,
            'features' => [['text' => 'Verified feature']], 'recommended_uses' => [['text' => 'Test use']], 'warranty_details' => [['text' => 'Test terms']], 'installation_instructions' => [['text' => 'Test instructions']], 'certifications' => 'Test certification',
            'specs' => ['operating_voltage_v' => 48, 'rated_capacity_kw' => 6.5, 'phase' => '1P', 'pv_capacity_w' => 9000, 'mppt_min_vdc' => 60, 'mppt_max_vdc' => 450, 'ip_rating' => 'IP21', 'depth_mm' => 124, 'width_mm' => 338, 'height_mm' => 513, 'true_height_mm' => 520, 'weight_kg' => 12],
        ];
    }

    public function test_inverter_crud_form_and_specifications_are_isolated_and_optional_fields_stay_null(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create());
        Livewire::test(CreateProduct::class)->assertSuccessful();
        $data = $this->data();
        $data['image'] = UploadedFile::fake()->image('inverter.png');
        $data['specification_visibility'] = ['mppt_voltage' => false];
        Livewire::test(CreateProduct::class)->fillForm($data)->call('create')->assertHasNoFormErrors();
        $product = Product::where('type', 'inverter')->firstOrFail();
        $this->assertSame('6.5000', $product->inverterSpecifications->rated_capacity_kw);
        $this->assertNull($product->price_pkr);
        $this->assertNull($product->inverterSpecifications->wifi);
        $this->assertNull($product->inverterSpecifications->bluetooth);
        $this->assertFalse($product->isSpecificationVisible('mppt_voltage'));
        $this->assertCount(4, $product->documents);
        $this->assertSame(0, $product->catalogTags()->count());
        Livewire::test(ListProducts::class)->assertCanSeeTableRecords([$product]);
        Livewire::test(EditProduct::class, ['record' => $product->id])->fillForm(['name' => 'Renamed inverter'])->call('save')->assertHasNoFormErrors();
        $this->assertSame($product->slug, $product->fresh()->slug);
        $product->refresh()->update(['status' => 'hidden']);
        $this->assertFalse(Product::forPublicUse()->whereKey($product->id)->exists());
        $product->delete();
        $this->assertDatabaseMissing('inverter_specifications', ['product_id' => $product->id]);
    }

    public function test_mppt_range_and_required_fields_are_enforced_on_server(): void
    {
        Storage::fake('public');
        $data = $this->data();
        $data['specs']['mppt_min_vdc'] = 600;
        try {
            app(ProductEditor::class)->save(new Product, $data, 'inverter');
            $this->fail('Reversed range accepted.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('specs.mppt_max_vdc', $e->errors());
        }
        $data = $this->data();
        unset($data['specs']['true_height_mm']);
        $this->expectException(ValidationException::class);
        app(ProductEditor::class)->save(new Product, $data, 'inverter');
    }

    public function test_hidden_incomplete_inverter_requires_complete_data_before_republication(): void
    {
        Storage::fake('public');
        $editor = app(ProductEditor::class);
        $product = $editor->save(new Product, $this->data(), 'inverter');
        $editor->save($product, ['status' => 'hidden', 'specs' => ['pv_capacity_w' => null]], 'inverter');
        $this->assertNull($product->fresh()->inverterSpecifications->pv_capacity_w);
        $this->expectException(ValidationException::class);
        $editor->save($product, ['status' => 'published'], 'inverter');
    }
}
