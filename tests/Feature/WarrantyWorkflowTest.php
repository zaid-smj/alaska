<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\WarrantyClaims\Pages\ListClaims;
use App\Filament\Resources\WarrantyClaims\Pages\ViewClaim;
use App\Filament\Resources\WarrantyRegistrations\Pages\ViewRegistration;
use App\Models\User;
use App\Models\Warranty\WarrantyClaim;
use App\Models\Warranty\WarrantyRegistration;
use App\Models\Warranty\WarrantyUpload;
use App\Services\Warranty\DocumentAutofill;
use App\Services\Warranty\WarrantyWorkflow;
use App\Warranty\WarrantyAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class WarrantyWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function data(array $overrides = []): array
    {
        return array_replace(['name' => 'Test Customer', 'phone' => '+923001234567', 'email' => 'customer@example.test', 'city' => 'Lahore', 'product_type' => 'dry-charge', 'product_model' => 'Paper Model', 'serial_number' => 'SER-123', 'card_number' => 'CARD-123', 'purchase_date' => '2026-01-01', 'dealer' => 'Test Dealer', 'submission_key' => (string) Str::uuid(), 'confirmed' => true, 'consent' => true], $overrides);
    }

    private function claim(array $overrides = []): array
    {
        return $this->data(array_replace(['problem_started_on' => now()->toDateString(), 'issue' => config('warranty.issues')[0], 'description' => 'Stops holding charge.'], $overrides));
    }

    public function test_registration_confirmation_idempotency_and_immutable_server_times(): void
    {
        $data = $this->data(['registered_at' => '2000-01-01', 'status' => 'approved']);
        $this->postJson('/warranty/registrations', array_replace($data, ['confirmed' => false]))->assertUnprocessable()->assertJsonValidationErrors('confirmed');
        $service = app(WarrantyWorkflow::class);
        $receipt = $service->submit('registration', $data, 'session-one');
        $this->assertSame($receipt, $service->submit('registration', $data, 'session-one'));
        $record = WarrantyRegistration::sole();
        $this->assertSame(now()->toDateString(), $record->registered_at->toDateString());
        $this->assertSame('2026-01-01', $record->purchase_date->toDateString());
        $this->assertArrayNotHasKey('registered_at', $record->form_snapshot);
        $this->assertNull($record->product_id);
        $this->expectException(ValidationException::class);
        $service->submit('registration', $data, 'different-session');
    }

    public function test_prior_registration_link_late_flag_and_unregistered_transition(): void
    {
        $service = app(WarrantyWorkflow::class);
        $receipt = $service->submit('registration', $this->data(), 's');
        WarrantyRegistration::sole()->update(['registered_at' => now()->subDays(10)]);
        $service->submit('claim', $this->claim(['registration_reference' => $receipt['reference']]), 's');
        $first = WarrantyClaim::sole();
        $this->assertSame('registered_before_problem', $first->registration_state);
        $this->assertNotNull($first->warranty_registration_id);
        $this->assertSame(1, $first->activities()->count());
        WarrantyRegistration::sole()->update(['registered_at' => now()]);
        $service->submit('claim', $this->claim(), 's');
        $this->assertSame('late_or_same_day_registration', WarrantyClaim::latest('id')->first()->registration_state);
        $result = $service->submit('claim', $this->claim(['serial_number' => 'UNREGISTERED', 'card_number' => null, 'status' => 'approved', 'assigned_to' => 1]), 's');
        $last = WarrantyClaim::latest('id')->first();
        $this->assertSame('unregistered_transition', $last->registration_state);
        $this->assertSame('new', $last->status);
        $this->assertNull($last->assigned_to);
        $this->assertArrayNotHasKey('email', $result);
    }

    public function test_wrong_reference_does_not_expose_customer_data(): void
    {
        $receipt = app(WarrantyWorkflow::class)->submit('registration', $this->data(), 's');
        $this->postJson('/warranty/claims', $this->claim(['registration_reference' => $receipt['reference'], 'email' => 'other@example.test']))->assertUnprocessable()->assertJsonValidationErrors('registration_reference')->assertDontSee('Test Customer');
        $this->assertDatabaseCount('warranty_claims', 0);
    }

    public function test_strict_mode_and_dates_are_validated(): void
    {
        config(['warranty.allow_unregistered_claims' => false]);
        $this->postJson('/warranty/claims', $this->claim())->assertUnprocessable()->assertJsonValidationErrors('registration_reference');
        $this->postJson('/warranty/claims', $this->claim(['problem_started_on' => '2025-01-01']))->assertUnprocessable()->assertJsonValidationErrors('problem_started_on');
    }

    public function test_private_upload_autofill_and_attachment_ownership(): void
    {
        Storage::fake('local');
        $upload = $this->post('/warranty/uploads', ['file' => UploadedFile::fake()->createWithContent('card.txt', "Customer Name: Printed Customer\nSerial Number: SERIAL-9\nPurchase Date: 2026-01-01\n")], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('fields.name', 'Printed Customer');
        $record = WarrantyUpload::findOrFail($upload->json('upload_id'));
        Storage::disk('local')->assertExists($record->path);
        $this->assertContains($this->get('/storage/'.$record->path)->status(), [403, 404]);
        $record->update(['session_hash' => hash('sha256', 'upload-session')]);
        app(WarrantyWorkflow::class)->submit('registration', $this->data(['upload_id' => $record->id]), 'upload-session');
        $this->assertNotNull($record->fresh()->warranty_registration_id);
        $this->artisan('warranty:prune-uploads')->assertSuccessful();
        Storage::disk('local')->assertExists($record->path);
        $this->expectException(ValidationException::class);
        app(WarrantyWorkflow::class)->submit('claim', $this->claim(['upload_id' => $record->id]), 'other-session');
    }

    public function test_upload_rejects_active_content_and_expired_files_are_pruned(): void
    {
        Storage::fake('local');
        $this->post('/warranty/uploads', ['file' => UploadedFile::fake()->createWithContent('bad.html', '<html><script>alert(1)</script></html>')], ['Accept' => 'application/json'])->assertUnprocessable();
        Storage::disk('local')->put('warranty/uploads/expired.txt', 'Expired');
        WarrantyUpload::create(['id' => (string) Str::uuid(), 'session_hash' => hash('sha256', 's'), 'path' => 'warranty/uploads/expired.txt', 'original_name' => 'expired.txt', 'mime' => 'text/plain', 'size' => 7, 'expires_at' => now()->subHour()]);
        $this->artisan('warranty:prune-uploads')->assertSuccessful();
        $this->assertDatabaseCount('warranty_uploads', 0);
        Storage::disk('local')->assertMissing('warranty/uploads/expired.txt');
    }

    public function test_staff_review_permissions_history_and_admin_pages(): void
    {
        app(WarrantyWorkflow::class)->submit('claim', $this->claim(), 's');
        $claim = WarrantyClaim::sole();
        $original = $claim->form_snapshot;
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $editor = User::factory()->create(['role' => AdminRole::ContentManager]);
        $this->assertTrue(WarrantyAccess::allows($admin));
        $this->assertFalse(WarrantyAccess::allows($editor));
        $this->actingAs($editor);
        Livewire::test(ListClaims::class)->assertForbidden();
        $editor->update(['can_manage_warranties' => true]);
        $this->assertTrue(WarrantyAccess::allows($editor));
        app(WarrantyWorkflow::class)->review($claim, $admin, ['status' => 'in_review', 'assigned_to' => $editor->id, 'note' => 'Checking original receipt.']);
        $this->assertSame('in_review', $claim->fresh()->status);
        $this->assertSame($original, $claim->fresh()->form_snapshot);
        $this->assertSame(2, $claim->activities()->count());
        $this->actingAs($admin);
        Livewire::test(ListClaims::class)->assertSuccessful();
        Livewire::test(ViewClaim::class, ['record' => $claim->id])->assertSuccessful()->assertSee('Checking original receipt.');
        app(WarrantyWorkflow::class)->submit('registration', $this->data(), 's');
        Livewire::test(ViewRegistration::class, ['record' => WarrantyRegistration::sole()->id])->assertSuccessful();
        $editor->update(['is_active' => false]);
        $this->assertFalse(WarrantyAccess::allows($editor));
    }

    public function test_warranty_pages_use_review_workflow_instead_of_preview(): void
    {
        foreach (['warranty', 'warranty-claim'] as $page) {
            $this->get('/'.$page.'.html')->assertOk()->assertSee('/js/warranty-workflow.js', false)->assertSee('csrf-token', false)->assertDontSee('data-preview-form', false)->assertDontSee('/js/form-preview.js', false);
        }
    }

    public function test_extraction_preserves_uncertainty_and_supports_text_and_docx(): void
    {
        $reader = app(DocumentAutofill::class);
        $fields = $reader->fields("Customer Name: Test Person\nPurchase Date: 03/04/2026\nProduct Type: lithium ion\nEmail: invalid\n");
        $this->assertSame(['name' => 'Test Person', 'product_type' => 'lithium-ion'], $fields);
        Storage::fake('local');
        $path = 'warranty/test.docx';
        Storage::disk('local')->put($path, '');
        $zip = new \ZipArchive;
        $zip->open(Storage::disk('local')->path($path), \ZipArchive::OVERWRITE);
        $zip->addFromString('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Customer Name: Document Person</w:t></w:r></w:p></w:body></w:document>');
        $zip->close();
        $this->assertSame('Document Person', $reader->extract($path, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')['fields']['name']);
    }

    public function test_real_image_ocr_reads_printed_fields(): void
    {
        Storage::fake('local');
        $image = imagecreatetruecolor(1400, 300);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);
        imagefill($image, 0, 0, $white);
        $font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
        imagettftext($image, 28, 0, 30, 70, $black, $font, 'Customer Name: Printed Person');
        imagettftext($image, 28, 0, 30, 140, $black, $font, 'Serial Number: ABC12345');
        $path = 'warranty/ocr.png';
        Storage::disk('local')->put($path, '');
        imagepng($image, Storage::disk('local')->path($path));
        $result = app(DocumentAutofill::class)->extract($path, 'image/png');
        $this->assertSame('suggestions', $result['status']);
        $this->assertSame('Printed Person', $result['fields']['name']);
        $this->assertSame('ABC12345', $result['fields']['serial_number']);
    }

    public function test_staff_attachment_download_requires_warranty_permission(): void
    {
        Storage::fake('local');
        app(WarrantyWorkflow::class)->submit('registration', $this->data(), 's');
        Storage::disk('local')->put('warranty/evidence.txt', 'Private synthetic evidence');
        $upload = WarrantyUpload::create(['id' => (string) Str::uuid(), 'session_hash' => hash('sha256', 's'), 'path' => 'warranty/evidence.txt', 'original_name' => 'evidence.txt', 'mime' => 'text/plain', 'size' => 26, 'expires_at' => now()->subHour(), 'warranty_registration_id' => WarrantyRegistration::sole()->id]);
        $url = route('filament.admin.warranty-files', ['upload' => $upload->id]);
        $this->get($url)->assertRedirect();
        $editor = User::factory()->create(['role' => AdminRole::ContentManager]);
        $editor->saveAppAuthenticationSecret('test-authenticator-secret');
        $this->actingAs($editor)->get($url)->assertForbidden();
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $admin->saveAppAuthenticationSecret('test-authenticator-secret');
        $this->actingAs($admin)->get($url)->assertOk()->assertDownload('evidence.txt');
        $this->artisan('warranty:prune-uploads')->assertSuccessful();
        Storage::disk('local')->assertExists('warranty/evidence.txt');
    }

    public function test_review_action_saves_notes_and_explicit_grant_is_super_admin_only(): void
    {
        app(WarrantyWorkflow::class)->submit('claim', $this->claim(), 's');
        $super = User::factory()->create(['role' => AdminRole::SuperAdmin]);
        $editor = User::factory()->create(['role' => AdminRole::ContentManager]);
        $this->actingAs($super);
        Livewire::test(EditUser::class, ['record' => $editor->id])->fillForm(['can_manage_warranties' => true])->call('save')->assertHasNoFormErrors();
        $this->assertTrue($editor->fresh()->can_manage_warranties);
        Livewire::test(ViewClaim::class, ['record' => WarrantyClaim::sole()->id])->callAction('review', data: ['status' => 'awaiting_information', 'assigned_to' => $editor->id, 'note' => 'Please verify paper warranty.'])->assertHasNoActionErrors();
        $this->assertDatabaseHas('warranty_claims', ['status' => 'awaiting_information', 'assigned_to' => $editor->id]);
        $this->assertDatabaseHas('warranty_claim_activities', ['note' => 'Please verify paper warranty.', 'actor_id' => $super->id]);
    }

    public function test_real_pdf_text_extraction(): void
    {
        Storage::fake('local');
        $stream = 'BT /F1 16 Tf 30 750 Td (Customer Name: PDF Person) Tj 0 -30 Td (Serial Number: PDF12345) Tj ET';
        $objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Length '.strlen($stream)." >>\nstream\n".$stream."\nendstream"];
        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $i => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n".$object."\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 6\n0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= sprintf('%010d 00000 n ', $offset)."\n";
        }
        $pdf .= "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n".$xref."\n%%EOF";
        Storage::disk('local')->put('warranty/synthetic.pdf', $pdf);
        $result = app(DocumentAutofill::class)->extract('warranty/synthetic.pdf', 'application/pdf');
        $this->assertSame('PDF Person', $result['fields']['name']);
        $this->assertSame('PDF12345', $result['fields']['serial_number']);
    }
}
