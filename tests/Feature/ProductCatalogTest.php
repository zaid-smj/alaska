<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Clusters\LeadAcid;
use App\Filament\Pages\InverterProducts;
use App\Filament\Pages\LithiumProducts;
use App\Filament\Resources\CatalogBanners\CatalogBannerResource;
use App\Filament\Resources\CatalogBanners\Pages\EditCatalogBanner;
use App\Filament\Resources\CatalogBanners\Pages\ListCatalogBanners;
use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\ProductSections\Pages\CreateProductSection;
use App\Filament\Resources\ProductSections\Pages\EditProductSection;
use App\Filament\Resources\ProductSections\Pages\ListProductSections;
use App\Filament\Resources\ProductSections\ProductSectionResource;
use App\Models\CatalogBanner;
use App\Models\Product;
use App\Models\ProductSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    private function product(array $attributes = [], ?ProductSection $section = null): Product
    {
        $product = Product::create($attributes + ['name' => 'Catalog battery', 'alt_text' => 'Catalog battery image', 'legacy_image_path' => 'assets/batteries/automotive/a55.png', 'status' => 'published', 'voltage' => 12, 'capacity_ah' => 32, 'plates' => 7, 'tags' => ['Automotive'], 'uses' => 'Small hatchbacks']);
        $product->sections()->attach($section ?? ProductSection::firstOrFail());

        return $product;
    }

    public function test_catalog_starts_with_six_sections_but_no_automatic_demo_products(): void
    {
        $this->assertSame(6, ProductSection::count());
        $this->assertSame(0, Product::count());
        $this->assertFileExists(public_path('assets/solutions/solutions-hero.webp'));
        $this->assertFileExists(public_path('assets/solutions/mobile/solutions-hero-mobile.webp'));
        $this->get('/lead-acid')->assertSee('assets/solutions/solutions-hero.webp', false);
        $this->get('/lead-acid')->assertOk()->assertSee('No batteries found')->assertDontSee('Special Batteries');
    }

    public function test_catalog_searches_specs_and_uses_and_requires_every_selected_tag(): void
    {
        $both = $this->product(['name' => 'Shared battery', 'tags' => ['Automotive', 'Backup'], 'weight_kg' => 6.54, 'box_size' => 'NS-40', 'warranty' => '9 Months', 'length' => 7.72, 'width' => 5.08, 'height' => 7.95, 'dimension_unit' => 'in']);
        $single = $this->product(['name' => 'Single tag battery']);
        $this->product(['name' => 'Draft hidden', 'status' => 'draft']);
        $this->product(['name' => 'Lithium hidden', 'type' => 'lithium-ion']);
        foreach (['12 V', '12V', '32Ah', '32 Ah', '6.54', 'NS-40', '9 Months', '7.72', 'hatchbacks', 'Shared', 'Backup'] as $q) {
            $this->get('/lead-acid?'.http_build_query(['q' => $q]))->assertOk()->assertSee($both->name);
        }
        $this->get('/lead-acid?'.http_build_query(['tags' => ['Automotive', 'Backup']]))->assertOk()->assertSee($both->name)->assertDontSee($single->name)->assertDontSee('Draft hidden')->assertDontSee('Lithium hidden');
        $this->get('/lead-acid?q=nonexistent')->assertOk()->assertSee('No batteries found')->assertDontSee('Shared battery');
    }

    public function test_sections_are_ordered_and_empty_sections_are_hidden(): void
    {
        $first = ProductSection::where('name', 'Deep Cycle')->firstOrFail();
        $first->update(['sort_order' => 0]);
        $this->product(['name' => 'Deep sample'], $first);
        $this->product(['name' => 'Dry sample']);
        $this->get('/lead-acid')->assertOk()->assertSeeInOrder(['Deep Cycle', 'Deep sample', 'Dry Charge', 'Dry sample'])->assertDontSee('Motorcycle');
    }

    public function test_deleting_section_preserves_products_as_drafts_even_when_shared(): void
    {
        $section = ProductSection::firstOrFail();
        $product = $this->product([], $section);
        $product->sections()->attach(ProductSection::where('id', '!=', $section->id)->firstOrFail());
        $section->delete();
        $this->assertDatabaseHas('products', ['id' => $product->id, 'status' => 'draft']);
        $this->assertSame(1, $product->sections()->count());
        $this->get('/products/'.$product->slug)->assertNotFound();
        $this->get('/products/compare-search')->assertJsonCount(0);
    }

    public function test_product_pages_are_public_only_for_published_sectioned_lead_acid_products(): void
    {
        $product = $this->product(['name' => 'A 60L', 'description' => '<script>alert(1)</script>', 'price_pkr' => '12345.50']);
        $this->get('/products/'.$product->slug)->assertOk()->assertSee('A 60L')->assertSee('PKR 12,345.50')->assertSee('&lt;script&gt;', false)->assertDontSee('<script>alert(1)</script>', false)->assertSee('/js/components.js', false);
        $product->sections()->detach();
        $this->get('/products/'.$product->slug)->assertNotFound();
        $this->get('/products/not-found')->assertNotFound();
        $this->get('/solutions/lithium-ion')->assertOk()->assertSee('Coming soon');
        $this->get('/solutions/inverters')->assertOk()->assertSee('Coming soon');
        $this->get('/dry-charge.html')->assertOk();
    }

    public function test_comparison_search_ignores_sidebar_filters_but_never_returns_drafts(): void
    {
        $this->product(['name' => 'Automotive battery']);
        $this->product(['name' => 'Backup battery', 'tags' => ['Backup']]);
        $this->product(['name' => 'Draft battery', 'status' => 'draft']);
        $this->get('/products/compare-search?q=battery&tags[]=Industrial')->assertOk()->assertJsonCount(2)->assertJsonStructure([['id', 'name', 'image', 'url', 'specifications' => ['Name', 'Plates', 'Voltage', 'Capacity (Ah)', 'Warranty', 'Weight', 'Box size', 'Dimensions', 'Tags', 'Uses']]]);
        $this->get('/products/compare-search?q=Backup')->assertJsonCount(1)->assertJsonPath('0.name', 'Backup battery');
    }

    public function test_catalog_admin_screens_render_and_roles_are_enforced(): void
    {
        $product = $this->product();
        foreach ([AdminRole::Admin, AdminRole::SuperAdmin] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]));
            foreach ([ProductResource::class, ProductSectionResource::class, CatalogBannerResource::class] as $resource) {
                $this->assertTrue($resource::canViewAny());
            }
        }
        foreach ([ListProducts::class, CreateProduct::class, ListProductSections::class, CreateProductSection::class, ListCatalogBanners::class] as $page) {
            Livewire::test($page)->assertSuccessful();
        }
        Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])->assertSuccessful();
        Livewire::test(EditProductSection::class, ['record' => ProductSection::first()->getRouteKey()])->assertSuccessful();
        Livewire::test(EditCatalogBanner::class, ['record' => CatalogBanner::first()->getRouteKey()])->assertSuccessful();
        auth()->logout();
        $this->assertFalse(ProductResource::canCreate());
        $this->assertFalse(ProductSectionResource::canDelete(ProductSection::first()));
        $this->get(ProductResource::getUrl('create'))->assertRedirect('/admin/login');
    }

    public function test_admin_can_create_product_with_image_sections_and_unique_stable_slug(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => AdminRole::Admin]));
        Livewire::test(CreateProduct::class)->fillForm([
            'name' => 'New 60L', 'alt_text' => 'New battery', 'image' => UploadedFile::fake()->image('battery.png'),
            'status' => 'published', 'sections' => [ProductSection::first()->id], 'tags' => ['Automotive', 'Backup'],
            'voltage' => 12, 'capacity_ah' => 42, 'dimension_unit' => 'mm', 'sort_order' => 0,
        ])->call('create')->assertHasNoFormErrors();
        $product = Product::where('name', 'New 60L')->firstOrFail();
        $this->assertSame('new-60l', $product->slug);
        $this->assertSame(1, $product->sections()->count());
        Storage::disk('public')->assertExists($product->image);
        $product->update(['name' => 'Renamed model']);
        $this->assertSame('new-60l', $product->fresh()->slug);
        $this->get('/products/new-60l')->assertOk()->assertSee('Renamed model');
        $this->assertDatabaseHas('audit_logs', ['event' => 'content.catalog.Product.created', 'actor_id' => auth()->id()]);
        $image = $product->image;
        $product->delete();
        Storage::disk('public')->assertMissing($image);
    }

    public function test_admin_must_assign_section_before_publishing_and_can_edit_banner(): void
    {
        $this->actingAs(User::factory()->create(['role' => AdminRole::Admin]));
        $product = $this->product(['status' => 'draft']);
        Livewire::test(EditProduct::class, ['record' => $product->id])->fillForm(['status' => 'published', 'sections' => []])->call('save')->assertHasFormErrors(['sections' => 'required']);
        $banner = CatalogBanner::firstOrFail();
        Livewire::test(EditCatalogBanner::class, ['record' => $banner->id])->fillForm(['title' => 'Our Lead Acid Range', 'subtitle' => 'Managed banner text'])->call('save')->assertHasNoFormErrors();
        $this->get('/lead-acid')->assertOk()->assertSee('Our Lead Acid Range')->assertSee('Managed banner text');
    }

    public function test_lead_acid_workspace_is_scoped_and_has_sections_and_banner_navigation(): void
    {
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $this->actingAs($admin);
        $lead = $this->product(['name' => 'Lead battery']);
        $lithium = $this->product(['name' => 'Lithium battery', 'type' => 'lithium-ion']);
        $inverter = $this->product(['name' => 'Inverter unit', 'type' => 'inverter']);
        Livewire::test(ListProducts::class)->assertCanSeeTableRecords([$lead])->assertCanNotSeeTableRecords([$lithium, $inverter]);
        $admin->saveAppAuthenticationSecret('test-authenticator-secret');
        $this->get(ProductResource::getUrl())->assertOk()->assertSee('Lead Acid Products')->assertSee('Sections &amp; order', false)->assertSee('Page banner')->assertSee('Lithium Products')->assertSee('Inverter Products');
        $this->assertStringContainsString('/lead-acid/', ProductResource::getUrl());
        $this->assertStringContainsString('/lead-acid/', ProductSectionResource::getUrl());
        $this->assertStringContainsString('/lead-acid/', CatalogBannerResource::getUrl());
        Livewire::test(LithiumProducts::class)->assertSuccessful()->assertSee('Coming soon');
        Livewire::test(InverterProducts::class)->assertSuccessful()->assertSee('Coming soon');
        auth()->logout();
        $this->assertFalse(LeadAcid::canAccess());
        $this->assertFalse(LithiumProducts::canAccess());
        $this->assertFalse(InverterProducts::canAccess());
    }
}
