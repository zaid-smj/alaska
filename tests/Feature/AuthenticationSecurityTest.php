<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\LoginSessions\LoginSessionResource;
use App\Models\LoginSession;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthenticationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_and_profile_routes_are_available(): void
    {
        $routes = collect(app('router')->getRoutes()->getRoutes())
            ->map(fn ($route): ?string => $route->getName());

        $this->assertTrue($routes->contains('filament.admin.auth.password-reset.request'));
        $this->assertTrue($routes->contains('filament.admin.auth.password-reset.reset'));
        $this->assertTrue($routes->contains('filament.admin.auth.profile'));
    }

    public function test_mfa_secrets_and_recovery_codes_are_encrypted_at_rest(): void
    {
        $user = User::factory()->create();

        $user->saveAppAuthenticationSecret('test-authenticator-secret');
        $user->saveAppAuthenticationRecoveryCodes(['recovery-code-one', 'recovery-code-two']);

        $stored = DB::table('users')->where('id', $user->id)->first();

        $this->assertNotSame('test-authenticator-secret', $stored->app_authentication_secret);
        $this->assertStringNotContainsString('recovery-code-one', $stored->app_authentication_recovery_codes);
        $this->assertSame('test-authenticator-secret', $user->fresh()->getAppAuthenticationSecret());
        $this->assertSame(
            ['recovery-code-one', 'recovery-code-two'],
            $user->fresh()->getAppAuthenticationRecoveryCodes(),
        );
    }

    public function test_password_reset_delivery_uses_laravels_secure_broker(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $status = Password::sendResetLink(['email' => $user->email]);

        $this->assertSame(Password::RESET_LINK_SENT, $status);
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_only_the_super_admin_can_view_login_sessions(): void
    {
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $superAdmin = User::factory()->create(['role' => AdminRole::SuperAdmin]);

        $this->actingAs($admin);
        $this->assertFalse(LoginSessionResource::canViewAny());

        $this->actingAs($superAdmin);
        $this->assertTrue(LoginSessionResource::canViewAny());
    }

    public function test_deactivating_an_admin_revokes_all_of_their_login_sessions(): void
    {
        $admin = User::factory()->create(['is_active' => true]);

        DB::table('sessions')->insert([
            'id' => 'first-test-session',
            'user_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test browser',
            'payload' => 'test-payload',
            'last_activity' => now()->timestamp,
        ]);

        $admin->update(['is_active' => false]);

        $this->assertDatabaseMissing('sessions', ['id' => 'first-test-session']);
    }

    public function test_login_session_view_only_includes_authenticated_non_expired_sessions(): void
    {
        $admin = User::factory()->create();

        DB::table('sessions')->insert([
            [
                'id' => 'active-authenticated-session',
                'user_id' => $admin->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Test browser',
                'payload' => 'test-payload',
                'last_activity' => now()->timestamp,
            ],
            [
                'id' => 'anonymous-session',
                'user_id' => null,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'curl',
                'payload' => 'test-payload',
                'last_activity' => now()->timestamp,
            ],
            [
                'id' => 'expired-authenticated-session',
                'user_id' => $admin->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Old browser',
                'payload' => 'test-payload',
                'last_activity' => now()->subMinutes(config('session.lifetime') + 1)->timestamp,
            ],
        ]);

        $this->assertSame(
            ['active-authenticated-session'],
            LoginSessionResource::getEloquentQuery()->pluck('id')->all(),
        );
    }

    public function test_login_session_exposes_readable_device_and_presence_labels(): void
    {
        $session = new LoginSession([
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit Chrome/140.0 Safari/537.36',
            'last_activity' => now()->timestamp,
        ]);

        $this->assertSame('Chrome on Windows', $session->device_label);
        $this->assertSame('Online', $session->presence_status);
    }
}
