<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\SalesCheckoutSettings\Pages\EditSettings;
use App\Filament\Resources\SalesCheckoutSettings\Pages\ListSettings;
use App\Filament\Resources\SalesRequests\Pages\ViewSalesRequest;
use App\Models\Product;
use App\Models\Sales\SalesCheckoutPreview;
use App\Models\Sales\SalesCheckoutSettings;
use App\Models\Sales\SalesRequest;
use App\Models\Sales\SalesTaxProfile;
use App\Models\User;
use App\Services\Sales\CheckoutWorkflow;
use App\Services\Sales\SalesWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class CheckoutOrdersTest extends TestCase
{
    use RefreshDatabase,\Tests\Support\CatalogFixtures;

    private function setupCheckout(): Product
    {
        $this->actingAs(User::factory()->create(['role' => AdminRole::Admin]));
        foreach (['lead-acid' => 1800, 'shipping' => 1600] as $family => $rate) {
            SalesTaxProfile::create(['name' => 'Synthetic '.$family.' tax', 'family' => $family, 'calculation_basis' => 'transaction_value', 'rate_basis_points' => $rate, 'price_includes_tax' => false, 'applicability_notes' => 'Synthetic test settings; not a real tax determination', 'source_url' => 'https://www.fbr.gov.pk/', 'effective_from' => now()->subDay()->toDateString(), 'is_active' => true]);
        }
        SalesCheckoutSettings::firstOrFail()->update(['checkout_enabled' => true, 'bank_accounts' => [['bank_name' => 'Synthetic Bank', 'account_title' => 'Synthetic Alaska Account', 'account_number' => 'TEST-ACCOUNT-ONLY']], 'bank_transfer_instructions' => 'Use the order reference. Await external verification.', 'cod_instructions' => 'Pay on delivery.']);

        return $this->legacyProduct(['name' => 'Checkout Battery', 'price_pkr' => '1000.00']);
    }

    private function confirmData(array $preview): array
    {
        return ['preview_id' => $preview['preview_id'], 'submission_key' => (string) Str::uuid(), 'name' => 'Test Guest', 'phone' => '+923001234567', 'email' => 'test@example.test', 'city' => 'Lahore', 'address' => 'Synthetic test address', 'customer_type' => 'individual', 'consent' => true, 'confirmed' => true];
    }

    private function preview($product, string $method = 'bank_transfer'): array
    {
        return app(CheckoutWorkflow::class)->preview(['payment_method' => $method, 'items' => [['product_id' => $product->id, 'quantity' => 2]]], 'session');
    }

    public function test_shipping_defaults_to_500_before_tax_and_total_is_backend_owned(): void
    {
        $this->assertSame(50000, SalesCheckoutSettings::firstOrFail()->shipping_fee_cents);
        $product = $this->setupCheckout();
        $preview = $this->preview($product);
        $this->assertSame(36000, $preview['pricing']['tax_cents']);
        $this->assertSame(50000, $preview['pricing']['shipping_cents']);
        $this->assertSame(8000, $preview['pricing']['shipping_tax_cents']);
        $this->assertSame(294000, $preview['pricing']['final_total_cents']);
        $data = $this->confirmData($preview) + ['final_total_cents' => 1, 'payment_status' => 'bank_transfer_verified', 'shipping_cents' => 0];
        $service = app(CheckoutWorkflow::class);
        $receipt = $service->confirm($data, 'session');
        $this->assertSame($receipt, $service->confirm($data, 'session'));
        $record = SalesRequest::sole();
        $this->assertSame('checkout', $record->request_kind);
        $this->assertSame('bank_transfer', $record->payment_method);
        $this->assertSame('awaiting_verification', $record->payment_status);
        $this->assertSame(294000, $record->checkout_snapshot['pricing']['final_total_cents']);
        $this->assertDatabaseCount('sales_requests', 1);
        $this->assertNull($record->payment_status_recorded_by);
    }

    public function test_price_or_bank_instruction_changes_require_new_customer_review(): void
    {
        $product = $this->setupCheckout();
        $preview = $this->preview($product);
        $product->update(['price_pkr' => '1100']);
        try {
            app(CheckoutWorkflow::class)->confirm($this->confirmData($preview), 'session');
            $this->fail('Stale price accepted');
        } catch (ValidationException) {
        }
        $preview = $this->preview($product);
        SalesCheckoutSettings::first()->update(['bank_transfer_instructions' => 'Changed bank instructions']);
        $this->expectException(ValidationException::class);
        app(CheckoutWorkflow::class)->confirm($this->confirmData($preview), 'session');
    }

    public function test_snapshots_do_not_change_with_prices_tax_settings_or_later_instructions(): void
    {
        $product = $this->setupCheckout();
        $preview = $this->preview($product);
        app(CheckoutWorkflow::class)->confirm($this->confirmData($preview), 'session');
        $record = SalesRequest::sole();
        $original = $record->checkout_snapshot;
        $product->update(['price_pkr' => '9999']);
        SalesCheckoutSettings::first()->update(['shipping_fee_cents' => 90000, 'bank_transfer_instructions' => 'Future orders only']);
        $this->assertSame($original, $record->fresh()->checkout_snapshot);
        $this->expectException(ValidationException::class);
        $record->update(['checkout_snapshot' => ['total' => 1]]);
    }

    public function test_cod_stays_separate_from_bank_and_no_payment_is_automatically_verified(): void
    {
        $product = $this->setupCheckout();
        $preview = $this->preview($product, 'cod');
        app(CheckoutWorkflow::class)->confirm($this->confirmData($preview), 'session');
        $record = SalesRequest::sole();
        $this->assertSame('cod', $record->payment_method);
        $this->assertSame('awaiting_collection', $record->payment_status);
        $this->assertArrayNotHasKey('bank_accounts', $preview['payment_instructions']);
        $actor = User::factory()->create(['role' => AdminRole::Sales]);
        app(SalesWorkflow::class)->paymentOutcome($record, $actor, ['payment_status' => 'cod_collected', 'reference' => 'External courier reference', 'note' => 'Collection confirmed by the team externally']);
        $this->assertSame('cod_collected', $record->fresh()->payment_status);
        $this->expectException(ValidationException::class);
        app(SalesWorkflow::class)->paymentOutcome($record, $actor, ['payment_status' => 'bank_transfer_verified', 'reference' => 'Wrong route', 'note' => 'Invalid bank outcome on COD']);
    }

    public function test_sales_users_record_external_verification_with_full_audit_and_no_bank_integration(): void
    {
        $product = $this->setupCheckout();
        $preview = $this->preview($product);
        app(CheckoutWorkflow::class)->confirm($this->confirmData($preview), 'session');
        $record = SalesRequest::sole();
        $actor = User::factory()->create(['role' => AdminRole::Sales]);
        $service = app(SalesWorkflow::class);
        try {
            $service->review($record, $actor, ['status' => 'shipped', 'note' => 'Would dispatch too early']);
            $this->fail('Unverified bank order dispatched');
        } catch (ValidationException) {
        }
        $service->paymentOutcome($record, $actor, ['payment_status' => 'bank_transfer_verified', 'reference' => 'FIN-42', 'note' => 'Finance team confirmed transfer externally']);
        $service->review($record, $actor, ['status' => 'shipped', 'note' => 'Shipment arranged by sales']);
        $this->assertSame($actor->id, $record->fresh()->payment_status_recorded_by);
        $this->assertNotNull($record->fresh()->payment_status_recorded_at);
        $this->assertDatabaseHas('sales_activities', ['actor_id' => $actor->id, 'event' => 'payment_outcome_recorded']);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $actor->id, 'event' => 'sales.payment_outcome_recorded']);
        $service->addNote($record, $actor, 'Handover: courier contacted, resources available with team.');
        $this->assertDatabaseHas('sales_activities', ['event' => 'note_added', 'actor_id' => $actor->id]);
    }

    public function test_expired_and_cross_session_previews_and_duplicate_checkout_are_safe(): void
    {
        $product = $this->setupCheckout();
        $preview = $this->preview($product);
        $data = $this->confirmData($preview);
        try {
            app(CheckoutWorkflow::class)->confirm($data, 'other-session');
            $this->fail('Other browser accessed preview');
        } catch (ValidationException) {
        }
        SalesCheckoutPreview::find($preview['preview_id'])->update(['expires_at' => now()->subMinute()]);
        $this->expectException(ValidationException::class);
        app(CheckoutWorkflow::class)->confirm($data, 'session');
    }

    public function test_quote_routing_quantity_unpriced_and_disabled_checkout_are_enforced(): void
    {
        $product = $this->setupCheckout();
        $service = app(CheckoutWorkflow::class);
        $result = $service->preview(['payment_method' => 'cod', 'items' => [['product_id' => $product->id, 'quantity' => 50]]], 'session');
        $this->assertTrue($result['requires_quote']);
        $this->assertDatabaseCount('sales_checkout_previews', 0);
        $product->update(['price_pkr' => null]);
        try {
            $this->preview($product);
            $this->fail('Unpriced checkout accepted');
        } catch (ValidationException) {
        }
        SalesCheckoutSettings::first()->update(['checkout_enabled' => false]);
        $this->expectException(ValidationException::class);
        $this->preview($product);
    }

    public function test_admin_settings_and_sales_order_pages_render_and_payment_actions_work(): void
    {
        $product = $this->setupCheckout();
        $settings = SalesCheckoutSettings::firstOrFail();
        Livewire::test(EditSettings::class, ['record' => $settings->id])->assertSuccessful();
        $preview = $this->preview($product);
        app(CheckoutWorkflow::class)->confirm($this->confirmData($preview), 'session');
        $record = SalesRequest::sole();
        $actor = User::factory()->create(['role' => AdminRole::Sales]);
        $this->actingAs($actor);
        Livewire::test(ViewSalesRequest::class, ['record' => $record->id])->assertSuccessful()->assertSee('Final payable total')->callAction('paymentOutcome', data: ['payment_status' => 'bank_transfer_verified', 'reference' => 'FIN-UI', 'note' => 'Externally verified by finance'])->assertHasNoActionErrors();
        Livewire::test(ListSettings::class)->assertForbidden();
        $this->expectException(HttpException::class);
        $settings->update(['shipping_fee_cents' => 1]);
    }

    public function test_admin_can_override_assignment_and_cancelled_orders_remain_retained(): void
    {
        $product = $this->setupCheckout();
        $preview = $this->preview($product);
        app(CheckoutWorkflow::class)->confirm($this->confirmData($preview), 'session');
        $record = SalesRequest::sole();
        $one = User::factory()->create(['role' => AdminRole::Sales]);
        $two = User::factory()->create(['role' => AdminRole::Sales]);
        $admin = auth()->user();
        $service = app(SalesWorkflow::class);
        $service->claim($record, $one);
        $service->transfer($record, $admin, ['assigned_to' => $two->id, 'expected_assigned_to' => null, 'note' => 'Admin reassignment without colleague approval']);
        $this->assertSame($two->id, $record->fresh()->assigned_to);
        $service->review($record, $two, ['status' => 'cancelled', 'note' => 'Customer cancelled externally']);
        $this->assertDatabaseHas('sales_requests', ['id' => $record->id, 'status' => 'cancelled']);
        $this->assertSame(294000, $record->fresh()->checkout_snapshot['pricing']['final_total_cents']);
    }

    public function test_preview_and_confirmation_endpoints_are_available_with_csrf_web_routes(): void
    {
        $product = $this->setupCheckout();
        auth()->logout();
        $this->postJson('/sales/checkout/preview', ['payment_method' => 'bank_transfer', 'items' => [['product_id' => $product->id, 'quantity' => 1]], 'price' => 1])->assertOk()->assertJsonStructure(['preview_id', 'pricing', 'payment_instructions'])->assertJsonPath('pricing.final_total_cents', 176000);
        $this->postJson('/sales/checkout/confirm', [])->assertUnprocessable()->assertJsonValidationErrors('preview_id');
    }

    public function test_expired_unused_previews_are_pruned_but_order_history_is_retained(): void
    {
        $product = $this->setupCheckout();
        $used = $this->preview($product);
        app(CheckoutWorkflow::class)->confirm($this->confirmData($used), 'session');
        $unused = $this->preview($product, 'cod');
        SalesCheckoutPreview::query()->update(['expires_at' => now()->subHour()]);
        $this->artisan('sales:prune-checkout-previews')->assertSuccessful();
        $this->assertDatabaseHas('sales_checkout_previews', ['id' => $used['preview_id']]);
        $this->assertDatabaseMissing('sales_checkout_previews', ['id' => $unused['preview_id']]);
        $this->assertDatabaseCount('sales_requests', 1);
    }

    public function test_shipping_admin_form_saves_pkr_values_and_public_options_exclude_bank_data(): void
    {
        $this->setupCheckout();
        $settings = SalesCheckoutSettings::firstOrFail();
        Livewire::test(EditSettings::class, ['record' => $settings->id])->fillForm(['shipping_fee_cents' => '600.00'])->call('save')->assertHasNoFormErrors();
        $this->assertSame(60000, $settings->fresh()->shipping_fee_cents);
        auth()->logout();
        $this->getJson('/sales/checkout/options')->assertOk()->assertJsonPath('shipping_before_tax_cents', 60000)->assertJsonPath('payment_methods.cod', true)->assertDontSee('TEST-ACCOUNT-ONLY');
    }

    public function test_only_active_super_admin_and_admin_can_edit_bank_payment_details(): void
    {
        $settings = SalesCheckoutSettings::firstOrFail();
        foreach (AdminRole::cases() as $role) {
            $user = User::factory()->create(['role' => $role, 'can_manage_sales' => true]);
            $this->actingAs($user);
            if (in_array($role, [AdminRole::SuperAdmin, AdminRole::Admin], true)) {
                Livewire::test(EditSettings::class, ['record' => $settings->id])
                    ->fillForm(['bank_accounts' => [['bank_name' => 'Permission test bank', 'account_title' => $role->getLabel(), 'account_number' => 'TEST-ONLY']], 'bank_transfer_instructions' => 'Permission test instructions'])
                    ->call('save')->assertHasNoFormErrors();
                $this->assertSame($role->getLabel(), $settings->fresh()->bank_accounts[0]['account_title']);
                $this->assertDatabaseHas('audit_logs', ['actor_id' => $user->id, 'event' => 'sales.checkout_settings.updated']);
            } else {
                Livewire::test(ListSettings::class)->assertForbidden();
                Livewire::test(EditSettings::class, ['record' => $settings->id])->assertForbidden();
                try {
                    $settings->fresh()->update(['bank_transfer_instructions' => 'Unauthorized change']);
                    $this->fail('Non-admin changed payment details.');
                } catch (HttpException $error) {
                    $this->assertSame(403, $error->getStatusCode());
                }
                $this->assertSame('Permission test instructions', $settings->fresh()->bank_transfer_instructions);
            }
        }
        $inactive = User::factory()->create(['role' => AdminRole::Admin, 'is_active' => false]);
        $this->actingAs($inactive);
        Livewire::test(ListSettings::class)->assertForbidden();
    }
}
