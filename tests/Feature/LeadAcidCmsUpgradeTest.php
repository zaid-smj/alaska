<?php

namespace Tests\Feature;

use App\Filament\Resources\Products\Pages\EditProduct;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductSeries;
use App\Models\Catalog\ProductTag;
use App\Models\Product;
use App\Models\User;
use App\Services\Catalog\ProductEditor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\Support\CatalogFixtures;
use Tests\TestCase;

class LeadAcidCmsUpgradeTest extends TestCase
{
    use CatalogFixtures, RefreshDatabase;

    public function test_incomplete_drafts_save_but_new_publication_is_enforced_on_server(): void
    {
        $editor = app(ProductEditor::class);
        $draft = $editor->save(new Product, ['name' => 'Unfinished', 'status' => 'draft'], 'lead-acid');
        $this->assertSame('draft', $draft->status);
        $this->assertCount(2, $draft->documents);
        $this->expectException(ValidationException::class);
        $draft->update(['status' => 'published']);
    }

    public function test_complete_product_publishes_and_preserves_legacy_public_contract(): void
    {
        Storage::fake('public');
        $data = $this->completeLeadAcidData();
        $data['specification_visibility'] = ['plates' => false, 'dimensions' => false];
        $product = app(ProductEditor::class)->save(new Product, $data, 'lead-acid');
        $this->assertSame('published', $product->status);
        $this->assertFalse($product->isSpecificationVisible('plates'));
        $this->assertSame(7, $product->plates);
        $this->assertSame('200.0000', $product->leadAcidSpecifications->depth_mm);
        $this->assertCount(1, $product->sections);
        $this->get('/lead-acid?q=42Ah')->assertOk()->assertSee($product->name);
        $this->get('/products/'.$product->slug)->assertOk();
        $this->get('/products/compare-search?q=Complete')->assertJsonPath('0.name', $product->name);
        $product->update(['status' => 'hidden']);
        $this->get('/products/'.$product->slug)->assertNotFound();
        $this->assertSame(0, Product::forPublicUse()->count());
    }

    public function test_grandfathered_record_can_be_edited_but_not_republished_incomplete(): void
    {
        $product = $this->legacyProduct(['length' => 7.72, 'dimension_unit' => 'in', 'warranty' => '6 months from sale']);
        $originalSlug = $product->slug;
        $this->assertNotEmpty($product->publicationIssues());
        $product->update(['description' => 'Safe editorial change']);
        $this->assertSame('published', $product->status);
        $this->assertSame($originalSlug, $product->slug);
        $this->assertSame('in', $product->dimension_unit);
        $this->assertNull($product->leadAcidSpecifications?->depth_mm);
        $product->update(['status' => 'draft']);
        $this->assertFalse($product->legacy_publication_exempt);
        $this->expectException(ValidationException::class);
        $product->update(['status' => 'published']);
    }

    public function test_primary_category_preserves_all_old_section_memberships(): void
    {
        $product = $this->legacyProduct();
        $category = ProductCategory::where('family', 'lead-acid')->where('legacy_section_id', '!=', $product->sections()->first()->id)->first();
        app(ProductEditor::class)->save($product, ['primary_category_id' => $category->id], 'lead-acid');
        $this->assertCount(2, $product->fresh()->sections);
        $this->assertSame($category->id, $product->primary_category_id);
    }

    public function test_classifications_are_scoped_and_used_series_cannot_be_deactivated(): void
    {
        Storage::fake('public');
        $product = app(ProductEditor::class)->save(new Product, $this->completeLeadAcidData(), 'lead-acid');
        try {
            $product->series->update(['is_active' => false]);
            $this->fail('Used series was deactivated.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('is_active', $e->errors());
        }
        $inverterSeries = ProductSeries::where('family', 'inverter')->first();
        $this->expectException(ValidationException::class);
        $product->update(['series_id' => $inverterSeries->id]);
    }

    public function test_visibility_cannot_make_a_required_specification_optional(): void
    {
        Storage::fake('public');
        $data = $this->completeLeadAcidData();
        $data['plates'] = null;
        $data['specification_visibility'] = ['plates' => false];
        $this->expectException(ValidationException::class);
        app(ProductEditor::class)->save(new Product, $data, 'lead-acid');
    }

    public function test_safe_legacy_form_edit_preserves_old_uses_dimensions_warranty_and_tags(): void
    {
        $product = $this->legacyProduct(['uses' => 'Small cars, generators', 'length' => 7.72, 'width' => 5.08, 'height' => 7.95, 'dimension_unit' => 'in', 'warranty' => 'Six months from sale']);
        $tag = ProductTag::where('family', 'lead-acid')->where('name', 'Automotive')->first();
        $product->catalogTags()->attach($tag->id);
        $before = $product->only(['slug', 'uses', 'length', 'width', 'height', 'dimension_unit', 'warranty', 'tags', 'status']);
        $this->actingAs(User::factory()->create());
        Livewire::test(EditProduct::class, ['record' => $product->id])
            ->fillForm(['description' => 'Edited without completing legacy specifications'])
            ->call('save')->assertHasNoFormErrors();
        $this->assertSame($before, $product->fresh()->only(array_keys($before)));
        $this->assertSame(['Small cars, generators'], $product->fresh()->recommended_uses);
    }
}
