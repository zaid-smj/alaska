<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\SalesTaxProfiles\Pages\CreateProfile;
use App\Filament\Resources\SalesTaxProfiles\SalesTaxProfileResource;
use App\Models\Sales\SalesTaxProfile;
use App\Models\User;
use App\Services\Sales\CheckoutCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class CheckoutTaxTest extends TestCase
{
    use RefreshDatabase,\Tests\Support\CatalogFixtures;

    private function profile(array $changes = []): SalesTaxProfile
    {
        $this->actingAs(User::factory()->create(['role' => AdminRole::Admin]));

        return SalesTaxProfile::create(array_replace(['name' => 'Test sales tax', 'family' => 'lead-acid', 'calculation_basis' => 'transaction_value', 'rate_basis_points' => 1800, 'price_includes_tax' => false, 'applicability_notes' => 'Synthetic test configuration, not an operational tax assumption', 'source_url' => 'https://www.fbr.gov.pk/', 'effective_from' => now()->subDay()->toDateString(), 'is_active' => true], $changes));
    }

    public function test_exclusive_and_inclusive_prices_are_calculated_without_double_charging(): void
    {
        $product = $this->legacyProduct(['price_pkr' => '1000.00']);
        $profile = $this->profile();
        $result = app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 2]], 0);
        $this->assertSame(36000, $result['tax_cents']);
        $this->assertSame(236000, $result['final_total_cents']);
        $product->update(['price_pkr' => '1180.00']);
        $profile->update(['price_includes_tax' => true]);
        $result = app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]], 0);
        $this->assertSame(18000, $result['tax_cents']);
        $this->assertSame(118000, $result['final_total_cents']);
    }

    public function test_no_guessed_taxes_and_no_false_final_total_for_unknown_shipping(): void
    {
        $product = $this->legacyProduct(['price_pkr' => '1000']);
        try {
            app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]], 0);
            $this->fail('Tax guessed');
        } catch (ValidationException) {
        }
        $this->profile();
        $result = app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]]);
        $this->assertNull($result['final_total_cents']);
        $this->assertFalse($result['ready_for_confirmation']);
    }

    public function test_forty_nine_unit_limit_and_unpriced_checkout_protection(): void
    {
        $product = $this->legacyProduct(['price_pkr' => null]);
        $result = app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 50]], 0);
        $this->assertTrue($result['requires_quote']);
        $this->assertArrayNotHasKey('final_total_cents', $result);
        $this->expectException(ValidationException::class);
        app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]], 0);
    }

    public function test_retail_price_taxation_uses_an_explicit_confirmed_basis(): void
    {
        $product = $this->legacyProduct(['price_pkr' => '800']);
        $this->profile(['calculation_basis' => 'retail_price']);
        try {
            app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]], 0);
            $this->fail('Retail tax base guessed');
        } catch (ValidationException) {
        }
        $product->update(['tax_retail_price_pkr' => '1000']);
        $result = app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]], 0);
        $this->assertSame(18000, $result['tax_cents']);
        $this->assertSame(98000, $result['final_total_cents']);
    }

    public function test_expired_or_ambiguous_rules_cannot_produce_checkout_totals(): void
    {
        $product = $this->legacyProduct(['price_pkr' => '1000']);
        $this->profile();
        $this->profile();
        $this->expectException(ValidationException::class);
        app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]], 0);
    }

    public function test_tax_profile_management_is_admin_only_and_drafts_do_not_apply(): void
    {
        $sales = User::factory()->create(['role' => AdminRole::Sales]);
        $this->actingAs($sales);
        $this->assertFalse(SalesTaxProfileResource::canCreate());
        $this->actingAs(User::factory()->create(['role' => AdminRole::Admin]));
        Livewire::test(CreateProfile::class)->assertSuccessful();
        $profile = $this->profile(['is_active' => false]);
        $this->assertNull($profile->approved_at);
    }

    public function test_inclusive_rounding_never_creates_negative_tax_components(): void
    {
        $product = $this->legacyProduct(['price_pkr' => '0.03']);
        $this->profile(['price_includes_tax' => true, 'additional_taxes' => [['name' => 'Synthetic zero component', 'rate_basis_points' => 0]]]);
        $result = app(CheckoutCalculator::class)->calculate([['product_id' => $product->id, 'quantity' => 1]], 0);
        foreach ($result['lines'][0]['taxes'] as $tax) {
            $this->assertGreaterThanOrEqual(0, $tax['amount_cents']);
        }
        $this->assertSame($result['tax_cents'], array_sum(array_column($result['lines'][0]['taxes'], 'amount_cents')));
        $this->assertSame(3, $result['final_total_cents']);
    }

    public function test_admin_tax_form_stores_percentages_as_basis_points(): void
    {
        $this->actingAs(User::factory()->create(['role' => AdminRole::Admin]));
        Livewire::test(CreateProfile::class)->fillForm(['name' => 'UI test rule', 'family' => 'lead-acid', 'calculation_basis' => 'transaction_value', 'rate_basis_points' => '18.00', 'price_includes_tax' => false, 'effective_from' => now()->toDateString(), 'source_url' => 'https://www.fbr.gov.pk/', 'applicability_notes' => 'Synthetic UI test, not a deployed tax rule', 'is_active' => false])->call('create')->assertHasNoFormErrors();
        $this->assertDatabaseHas('sales_tax_profiles', ['name' => 'UI test rule', 'rate_basis_points' => 1800, 'is_active' => false]);
    }
}
