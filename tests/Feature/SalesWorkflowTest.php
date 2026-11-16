<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Pages\SalesOverview;
use App\Filament\Pages\SalesReport;
use App\Filament\Resources\SalesRequests\Pages\ListSalesRequests;
use App\Filament\Resources\SalesRequests\Pages\ViewSalesRequest;
use App\Models\Sales\SalesAttachment;
use App\Models\Sales\SalesRequest;
use App\Models\User;
use App\Services\Sales\SalesReports;
use App\Services\Sales\SalesWorkflow;
use App\Services\StaffManagement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class SalesWorkflowTest extends TestCase
{
    use RefreshDatabase, \Tests\Support\CatalogFixtures;

    private function data(array $changes = []): array
    {
        return array_replace(['submission_key' => (string) Str::uuid(), 'source' => 'quote', 'name' => 'Visitor', 'email' => 'visitor@example.test', 'phone' => '+923001234567', 'city' => 'Lahore', 'customer_type' => 'individual', 'consent' => true, 'confirmed' => true, 'items' => [['name' => 'Unpriced model', 'quantity' => 50]]], $changes);
    }

    private function requestRecord(): SalesRequest
    {
        app(SalesWorkflow::class)->submit($this->data(), 'session');

        return SalesRequest::latest('id')->firstOrFail();
    }

    private function sales(): User
    {
        return User::factory()->create(['role' => AdminRole::Sales]);
    }

    public function test_guest_quotes_are_separate_idempotent_and_keep_unknown_prices_null(): void
    {
        $service = app(SalesWorkflow::class);
        $data = $this->data(['assigned_to' => 1, 'status' => 'completed', 'checkout_snapshot' => ['paid' => true]]);
        $receipt = $service->submit($data, 'session');
        $this->assertSame($receipt, $service->submit($data, 'session'));
        $record = SalesRequest::sole();
        $this->assertSame('quote', $record->request_kind);
        $this->assertSame('new', $record->status);
        $this->assertNull($record->assigned_to);
        $this->assertNull($record->estimate_cents);
        $this->assertNull($record->checkout_snapshot);
        $this->assertNull($record->items->first()->unit_price_cents);
        $this->assertSame(1, $record->activities()->count());
        $this->expectException(ValidationException::class);
        $service->submit($data, 'different-session');
    }

    public function test_checkout_is_not_enabled_or_mislabeled_as_quote_without_confirmation(): void
    {
        $this->postJson('/sales/requests', $this->data(['source' => 'cart']))->assertUnprocessable()->assertJsonValidationErrors('source');
        $this->assertDatabaseCount('sales_requests', 0);
        $this->postJson('/sales/requests', $this->data(['confirmed' => false]))->assertUnprocessable()->assertJsonValidationErrors('confirmed');
    }

    public function test_claim_ownership_is_visible_and_other_staff_cannot_silently_claim_it(): void
    {
        $record = $this->requestRecord();
        $one = $this->sales();
        $two = $this->sales();
        $service = app(SalesWorkflow::class);
        $service->claim($record, $one);
        $service->claim($record, $one);
        $this->assertSame($one->id, $record->fresh()->assigned_to);
        $this->assertNotNull($record->fresh()->claimed_at);
        $this->assertSame('assigned', $record->fresh()->status);
        $this->assertSame(2, $record->activities()->count());
        $this->actingAs($two);
        Livewire::test(ListSalesRequests::class)->assertSuccessful()->assertCanSeeTableRecords([$record]);
        Livewire::test(ViewSalesRequest::class, ['record' => $record->id])->assertSee($one->name);
        $this->expectException(ValidationException::class);
        $service->claim($record, $two);
    }

    public function test_any_sales_colleague_can_transfer_with_history_and_stale_transfer_is_rejected(): void
    {
        $record = $this->requestRecord();
        $one = $this->sales();
        $two = $this->sales();
        $service = app(SalesWorkflow::class);
        $service->claim($record, $one);
        $service->transfer($record, $two, ['assigned_to' => $two->id, 'expected_assigned_to' => $one->id, 'note' => 'Covering colleague on leave']);
        $this->assertSame($two->id, $record->fresh()->assigned_to);
        $this->assertDatabaseHas('sales_activities', ['sales_request_id' => $record->id, 'actor_id' => $two->id, 'event' => 'transferred', 'note' => 'Covering colleague on leave']);
        $this->expectException(ValidationException::class);
        $service->transfer($record, $one, ['assigned_to' => $one->id, 'expected_assigned_to' => $one->id, 'note' => 'Stale form']);
    }

    public function test_transfer_rejects_inactive_and_unauthorized_targets(): void
    {
        $record = $this->requestRecord();
        $actor = $this->sales();
        $marketing = User::factory()->create(['role' => AdminRole::Marketing]);
        $this->expectException(ValidationException::class);
        app(SalesWorkflow::class)->transfer($record, $actor, ['assigned_to' => $marketing->id, 'expected_assigned_to' => null, 'note' => 'Invalid transfer']);
    }

    public function test_staff_record_external_outcomes_without_invoices_or_payment_gates(): void
    {
        $record = $this->requestRecord();
        $actor = $this->sales();
        $service = app(SalesWorkflow::class);
        $service->review($record, $actor, ['status' => 'completed', 'note' => 'Sales team completed this externally', 'external_reference' => 'EXTERNAL-42']);
        $this->assertNotNull($record->fresh()->completed_at);
        $this->assertSame('EXTERNAL-42', $record->fresh()->external_reference);
        $this->assertNull($record->invoice);
        $service->review($record, $actor, ['status' => 'return_requested', 'note' => 'Customer contacted the team']);
        $this->assertNull($record->fresh()->completed_at);
        $service->review($record, $actor, ['status' => 'refunded', 'note' => 'Accounts confirmed refund externally']);
        $this->assertSame('refunded', $record->fresh()->status);
        $this->assertDatabaseCount('sales_payments', 0);
    }

    public function test_status_changes_need_a_reason_and_cannot_change_owner_through_review(): void
    {
        $record = $this->requestRecord();
        $actor = $this->sales();
        $service = app(SalesWorkflow::class);
        try {
            $service->review($record, $actor, ['status' => 'completed']);
            $this->fail('Missing outcome note');
        } catch (ValidationException) {
        }
        $service->review($record, $actor, ['status' => 'new', 'note' => 'Called customer', 'assigned_to' => $actor->id]);
        $this->assertNull($record->fresh()->assigned_to);
    }

    public function test_filament_claim_transfer_and_review_actions_work_without_finance_actions(): void
    {
        $record = $this->requestRecord();
        $actor = $this->sales();
        $two = $this->sales();
        $this->actingAs($actor);
        Livewire::test(ViewSalesRequest::class, ['record' => $record->id])->assertActionDoesNotExist('invoice')->assertActionDoesNotExist('cash')->callAction('claim')->assertHasNoActionErrors();
        Livewire::test(ViewSalesRequest::class, ['record' => $record->id])->callAction('transfer', data: ['assigned_to' => $two->id, 'expected_assigned_to' => $actor->id, 'note' => 'Handover'])->assertHasNoActionErrors();
        Livewire::test(ViewSalesRequest::class, ['record' => $record->id])->callAction('review', data: ['status' => 'proposal_sent', 'note' => 'Proposal emailed outside website', 'external_reference' => 'PROP-123'])->assertHasNoActionErrors();
        $this->assertSame('proposal_sent', $record->fresh()->status);
    }

    public function test_private_attachments_remain_owned_and_protected(): void
    {
        Storage::fake('local');
        $response = $this->post('/sales/attachments', ['file' => UploadedFile::fake()->image('po.png')], ['Accept' => 'application/json'])->assertOk();
        $file = SalesAttachment::findOrFail($response->json('upload_id'));
        $file->update(['session_hash' => hash('sha256', 'session')]);
        app(SalesWorkflow::class)->submit($this->data(['upload_id' => $file->id]), 'session');
        $this->assertNotNull($file->fresh()->sales_request_id);
        $actor = $this->sales();
        $actor->saveAppAuthenticationSecret('test-authenticator-secret');
        $this->actingAs($actor)->get(route('filament.admin.sales-attachment', ['attachment' => $file]))->assertOk()->assertDownload('po.png');
        $file->update(['expires_at' => now()->subDay()]);
        $this->artisan('sales:prune-attachments')->assertSuccessful();
        Storage::disk('local')->assertExists($file->path);
        $this->expectException(ValidationException::class);
        app(SalesWorkflow::class)->submit($this->data(['upload_id' => $file->id]), 'other-session');
    }

    public function test_operational_reports_count_requests_not_inferred_revenue(): void
    {
        $record = $this->requestRecord();
        $actor = $this->sales();
        app(SalesWorkflow::class)->claim($record, $actor);
        app(SalesWorkflow::class)->review($record, $actor, ['status' => 'contacted', 'note' => 'Contacted externally', 'follow_up_at' => now()->subHour()]);
        foreach (['day', 'week', 'month', 'year'] as $period) {
            $report = app(SalesReports::class)->summarize(null, null, $period);
            $this->assertSame(1, $report['quotes']);
            $this->assertSame(1, $report['claimed']);
            $this->assertSame(1, $report['overdue']);
            $this->assertArrayNotHasKey('gross_cents', $report);
        }
        $this->actingAs($actor);
        Livewire::test(SalesOverview::class)->assertSuccessful();
        Livewire::test(SalesReport::class)->assertSuccessful();
    }

    public function test_existing_prices_are_preserved_and_legacy_finance_routes_are_gone(): void
    {
        $product = $this->legacyProduct(['name' => 'Priced model', 'price_pkr' => '1234.56']);
        app(SalesWorkflow::class)->submit($this->data(['items' => [['name' => $product->name, 'quantity' => 1]]]), 'session');
        $record = SalesRequest::sole();
        $this->assertSame(123456, $record->estimate_cents);
        $product->update(['price_pkr' => '9999']);
        $this->assertSame(123456, (int) $record->items()->first()->unit_price_cents);
        $this->get('/admin/sales-invoices/1')->assertNotFound();
        $this->get('/admin/sales-discounts')->assertNotFound();
        $this->get('/admin/dealer-tiers')->assertNotFound();
    }

    public function test_marketing_cannot_read_sales_and_admin_cannot_grant_overrides(): void
    {
        $actor = User::factory()->create(['role' => AdminRole::Marketing]);
        $this->actingAs($actor);
        Livewire::test(ListSalesRequests::class)->assertForbidden();
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $sales = $this->sales();
        $this->expectException(HttpException::class);
        app(StaffManagement::class)->update($admin, $sales, ['can_manage_sales' => true]);
    }
}
