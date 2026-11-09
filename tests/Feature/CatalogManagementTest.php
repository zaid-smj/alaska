<?php

namespace Tests\Feature;

use App\Catalog\CatalogData;
use App\Enums\AdminRole;
use App\Filament\Resources\InverterBanners\Pages\ListBanners;
use App\Filament\Resources\InverterProducts\InverterProductResource;
use App\Filament\Resources\LeadAcidSeries\Pages\CreateItem;
use App\Filament\Resources\LithiumProducts\LithiumProductResource;
use App\Filament\Resources\Products\ProductResource;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductSeries;
use App\Models\Catalog\ProductTag;
use App\Models\CatalogBanner;
use App\Models\Product;
use App\Models\User;
use App\Models\Vehicles\VehicleFitment;
use App\Models\Vehicles\VehicleMake;
use App\Models\Vehicles\VehicleModel;
use App\Services\Catalog\ProductEditor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\Support\CatalogFixtures;
use Tests\TestCase;

class CatalogManagementTest extends TestCase
{
    use CatalogFixtures, RefreshDatabase;

    public function test_gallery_and_lists_keep_order_and_documents_keep_visibility(): void
    {
        Storage::fake('public');
        $editor = app(ProductEditor::class);
        $data = $this->completeLeadAcidData();
        $paths = [UploadedFile::fake()->image('one.png')->store('content/products', 'public'), UploadedFile::fake()->image('two.webp')->store('content/products', 'public')];
        $data['gallery'] = [['path' => $paths[0], 'alt_text' => 'First'], ['path' => $paths[1], 'alt_text' => 'Second']];
        $data['features'] = [['text' => 'Second feature'], ['text' => 'First feature']];
        $data['certifications_visible'] = false;
        Storage::disk('public')->put('content/products/documents/test.pdf', "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF");
        $data['documents'] = ['datasheet' => ['path' => 'content/products/documents/test.pdf', 'is_visible' => false]];
        $product = $editor->save(new Product, $data, 'lead-acid');
        $this->assertSame(['Second feature', 'First feature'], $product->features);
        $this->assertFalse($product->certifications_visible);
        $this->assertFalse($product->documents()->where('slot', 'datasheet')->first()->is_available);
        $gallery = $product->galleryImages()->get();
        $editor->save($product, ['gallery' => [['id' => $gallery[1]->id, 'path' => $paths[1]], ['id' => $gallery[0]->id, 'path' => $paths[0]]], 'documents' => ['datasheet' => ['is_visible' => true]]], 'lead-acid');
        $this->assertSame([$paths[1], $paths[0]], $product->galleryImages()->pluck('path')->all());
        $this->assertTrue($product->documents()->where('slot', 'datasheet')->first()->is_available);
        $record = CatalogData::forProduct($product->fresh());
        $this->assertSame('kg', $record['specifications']['secondary']['dry_weight_kg']['unit']);
        $this->assertFalse($record['certifications']['is_visible']);
        $this->assertTrue($record['documents']['datasheet']['is_available']);
    }

    public function test_non_pdf_documents_are_rejected_even_when_invisible(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('content/products/documents/not-pdf.pdf', 'This is a text file, not a PDF.');
        $data = $this->completeLeadAcidData();
        $data['documents'] = ['datasheet' => ['path' => 'content/products/documents/not-pdf.pdf', 'is_visible' => false]];
        $this->expectException(ValidationException::class);
        app(ProductEditor::class)->save(new Product, $data, 'lead-acid');
    }

    public function test_taxonomy_crud_name_scoping_and_deactivation_safety(): void
    {
        $a = ProductSeries::create(['family' => 'lead-acid', 'name' => 'Shared name']);
        $b = ProductSeries::create(['family' => 'inverter', 'name' => 'Shared name']);
        $a->update(['name' => 'Renamed', 'is_active' => false]);
        $this->assertSame('Shared name', $b->fresh()->name);
        $a->delete();
        $this->assertDatabaseMissing('product_series', ['id' => $a->id]);
        $category = ProductCategory::create(['family' => 'lead-acid', 'name' => 'New category', 'sort_order' => 50]);
        $this->assertNotNull($category->legacy_section_id);
        $category->update(['name' => 'Renamed category', 'sort_order' => 1]);
        $this->assertSame('Renamed category', $category->legacySection->fresh()->name);
        $product = $this->legacyProduct();
        $category = ProductCategory::where('legacy_section_id', $product->sections()->first()->id)->first();
        $this->expectException(ValidationException::class);
        $category->update(['is_active' => false]);
    }

    public function test_product_names_are_unique_per_family_and_cross_family_tags_are_rejected(): void
    {
        $editor = app(ProductEditor::class);
        $editor->save(new Product, ['name' => 'Same model'], 'lead-acid');
        $other = $editor->save(new Product, ['name' => 'Same model'], 'inverter');
        try {
            $editor->save(new Product, ['name' => 'Same model'], 'lead-acid');
            $this->fail('Duplicate family name accepted.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('name', $e->errors());
        }
        $tag = ProductTag::where('family', 'lead-acid')->first();
        $this->expectException(ValidationException::class);
        $other->catalogTags()->attach($tag->id);
    }

    public function test_family_resources_reject_cross_family_record_urls_and_preserve_roles(): void
    {
        $other = app(ProductEditor::class)->save(new Product, ['name' => 'Other product'], 'inverter');
        foreach ([AdminRole::SuperAdmin, AdminRole::Admin, AdminRole::ContentManager] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->actingAs($user);
            foreach ([ProductResource::class, InverterProductResource::class, LithiumProductResource::class] as $resource) {
                $this->assertTrue($resource::canCreate());
            }
        }
        $user->saveAppAuthenticationSecret('test-authenticator-secret');
        $this->get(ProductResource::getUrl('edit', ['record' => $other->id]))->assertNotFound();
        $user->update(['is_active' => false]);
        $this->assertFalse(InverterProductResource::canCreate());
        $this->assertFalse(LithiumProductResource::canCreate());
    }

    public function test_independent_banner_edit_does_not_change_lead_acid_banner(): void
    {
        $lead = CatalogBanner::where('family', 'lead-acid')->first();
        $original = $lead->getAttributes();
        $inverter = CatalogBanner::where('family', 'inverter')->first();
        $inverter->update(['title' => 'Inverter-only title']);
        $this->assertSame($original, $lead->fresh()->getAttributes());
        $this->actingAs(User::factory()->create());
        Livewire::test(ListBanners::class)->assertCanSeeTableRecords([$inverter])->assertCanNotSeeTableRecords([$lead]);
    }

    public function test_vehicle_structure_starts_empty_and_only_accepts_verified_lead_acid_links(): void
    {
        $this->assertSame(0, VehicleMake::count());
        $make = VehicleMake::create(['name' => 'Test make']);
        $model = VehicleModel::create(['vehicle_make_id' => $make->id, 'name' => 'Test model']);
        $fitment = VehicleFitment::create(['vehicle_model_id' => $model->id, 'year_from' => 2020, 'year_to' => 2024]);
        $lead = app(ProductEditor::class)->save(new Product, ['name' => 'Lead draft'], 'lead-acid');
        $fitment->products()->attach($lead->id);
        $this->assertSame($fitment->id, $lead->vehicleFitments()->first()->id);
        try {
            VehicleFitment::create(['vehicle_model_id' => $model->id, 'year_from' => 2025, 'year_to' => 2020]);
            $this->fail('Reversed years accepted.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('year_to', $e->errors());
        }
        $inverter = app(ProductEditor::class)->save(new Product, ['name' => 'Inverter draft'], 'inverter');
        $this->expectException(ValidationException::class);
        $fitment->products()->attach($inverter->id);
    }

    public function test_all_classification_and_vehicle_forms_render_for_content_manager(): void
    {
        $this->actingAs(User::factory()->create(['role' => AdminRole::ContentManager]));
        foreach ([
            CreateItem::class,
            \App\Filament\Resources\LeadAcidTags\Pages\CreateItem::class,
            \App\Filament\Resources\InverterSeries\Pages\CreateItem::class,
            \App\Filament\Resources\InverterCategories\Pages\CreateItem::class,
            \App\Filament\Resources\InverterTags\Pages\CreateItem::class,
            \App\Filament\Resources\LithiumSeries\Pages\CreateItem::class,
            \App\Filament\Resources\LithiumCategories\Pages\CreateItem::class,
            \App\Filament\Resources\LithiumTags\Pages\CreateItem::class,
            \App\Filament\Resources\VehicleMakes\Pages\CreateItem::class,
            \App\Filament\Resources\VehicleModels\Pages\CreateItem::class,
            \App\Filament\Resources\VehicleFitments\Pages\CreateItem::class,
        ] as $page) {
            Livewire::test($page)->assertSuccessful();
        }
    }
}
