<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\AuditLogs\AuditLogResource;
use App\Models\AuditLog;
use App\Models\LoginEvent;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class AuditLoggingTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_the_super_admin_can_view_the_audit_log(): void
    {
        $superAdmin = User::factory()->create(['role' => AdminRole::SuperAdmin]);
        $admin = User::factory()->create(['role' => AdminRole::Admin]);

        $this->actingAs($superAdmin);
        $this->assertTrue(AuditLogResource::canViewAny());

        $this->actingAs($admin);
        $this->assertFalse(AuditLogResource::canViewAny());
    }

    public function test_sign_in_and_failed_sign_in_attempts_are_kept_out_of_the_audit_log(): void
    {
        $user = User::factory()->create();
        AuditLog::query()->delete();

        Event::dispatch(new Login('web', $user, false));
        Event::dispatch(new Failed('web', null, ['email' => 'Missing@Example.com']));

        $this->assertDatabaseHas('login_events', [
            'event' => 'login',
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('login_events', [
            'event' => 'failed',
            'attempted_email' => 'missing@example.com',
        ]);
        $this->assertSame(0, AuditLog::count());
        $this->assertSame(2, LoginEvent::count());
    }

    public function test_account_changes_are_recorded_without_sensitive_values(): void
    {
        $user = User::factory()->create();
        AuditLog::query()->delete();

        $user->update([
            'name' => 'Updated Administrator',
            'password' => 'DifferentPassword123!',
        ]);

        $entry = AuditLog::where('event', 'admin.updated')->sole();

        $this->assertNotSame('Updated Administrator', $entry->metadata['changes']['name']['from']);
        $this->assertSame('Updated Administrator', $entry->metadata['changes']['name']['to']);
        $this->assertArrayNotHasKey('password', $entry->metadata['changes']);
        $this->assertStringNotContainsString('DifferentPassword123!', json_encode($entry->metadata));
    }
}
