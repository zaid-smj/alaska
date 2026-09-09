<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SuperAdminRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_initial_super_admin_can_be_created_securely(): void
    {
        $this->artisan('admin:create-super')
            ->expectsQuestion('Full name', 'Business Owner')
            ->expectsQuestion('Email address', 'OWNER@EXAMPLE.COM')
            ->expectsQuestion('Password', 'StrongPassword123!')
            ->expectsQuestion('Confirm password', 'StrongPassword123!')
            ->expectsOutput('The Super Admin account was created successfully.')
            ->assertSuccessful();

        $superAdmin = User::firstOrFail();

        $this->assertSame('owner@example.com', $superAdmin->email);
        $this->assertSame(AdminRole::SuperAdmin, $superAdmin->role);
        $this->assertTrue($superAdmin->is_active);
        $this->assertNotNull($superAdmin->email_verified_at);
    }

    public function test_a_second_super_admin_cannot_be_created(): void
    {
        User::factory()->create(['role' => AdminRole::SuperAdmin]);

        $this->artisan('admin:create-super')
            ->expectsOutput('A Super Admin account already exists.')
            ->assertFailed();

        $this->assertSame(1, User::where('role', AdminRole::SuperAdmin)->count());
    }

    public function test_server_recovery_clears_super_admin_mfa_and_sessions(): void
    {
        $superAdmin = User::factory()->create(['role' => AdminRole::SuperAdmin]);
        $superAdmin->saveAppAuthenticationSecret('test-secret');
        $superAdmin->saveAppAuthenticationRecoveryCodes(['test-recovery-code']);

        DB::table('sessions')->insert([
            'id' => 'super-admin-session',
            'user_id' => $superAdmin->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test browser',
            'payload' => 'test-payload',
            'last_activity' => now()->timestamp,
        ]);

        $this->artisan('admin:reset-super-mfa')
            ->expectsConfirmation("Reset MFA and revoke every login session for {$superAdmin->email}?", 'yes')
            ->expectsOutput('Super Admin MFA was reset and all login sessions were revoked.')
            ->assertSuccessful();

        $superAdmin->refresh();

        $this->assertNull($superAdmin->getAppAuthenticationSecret());
        $this->assertNull($superAdmin->getAppAuthenticationRecoveryCodes());
        $this->assertDatabaseMissing('sessions', ['id' => 'super-admin-session']);
    }
}
