<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\WorkSessions\WorkSessionResource;
use App\Models\User;
use App\Models\WorkSession;
use App\Services\WorkSessionService;
use Filament\Support\Facades\FilamentTimezone;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class WorkSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_only_the_super_admin_can_view_employee_sessions(): void
    {
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $superAdmin = User::factory()->create(['role' => AdminRole::SuperAdmin]);

        $this->actingAs($admin);
        $this->assertFalse(WorkSessionResource::canViewAny());

        $this->actingAs($superAdmin);
        $this->assertTrue(WorkSessionResource::canViewAny());
    }

    public function test_admin_dates_use_pakistan_time_while_storage_remains_utc(): void
    {
        $storedTime = Carbon::parse('2026-09-09 09:00:00', 'UTC');

        $this->assertSame('UTC', config('app.timezone'));
        $this->assertSame('Asia/Karachi', config('app.display_timezone'));
        $this->assertSame('Asia/Karachi', FilamentTimezone::get());
        $this->assertSame(
            '2026-09-09 14:00:00',
            $storedTime->timezone(FilamentTimezone::get())->format('Y-m-d H:i:s'),
        );
    }

    public function test_successful_login_starts_one_work_session_and_logout_ends_it(): void
    {
        Carbon::setTestNow('2026-09-09 09:00:00');
        $user = User::factory()->create();

        Event::dispatch(new Login('web', $user, false));
        Event::dispatch(new Login('web', $user, false));

        $this->assertSame(1, WorkSession::where('user_id', $user->id)->count());

        Carbon::setTestNow('2026-09-09 10:30:00');
        Event::dispatch(new Logout('web', $user));

        $session = WorkSession::where('user_id', $user->id)->sole();
        $this->assertSame('logout', $session->end_reason);
        $this->assertSame('1h 30m', $session->duration_label);
    }

    public function test_heartbeat_starts_and_refreshes_the_current_work_session(): void
    {
        Carbon::setTestNow('2026-09-09 09:00:00');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('admin.work-session.heartbeat'))
            ->assertNoContent();

        Carbon::setTestNow('2026-09-09 09:10:00');

        $this->actingAs($user)
            ->post(route('admin.work-session.heartbeat'))
            ->assertNoContent();

        $session = WorkSession::where('user_id', $user->id)->sole();
        $this->assertSame('2026-09-09 09:00:00', $session->started_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-09-09 09:10:00', $session->last_seen_at->format('Y-m-d H:i:s'));
        $this->assertNull($session->ended_at);
    }

    public function test_inactivity_closes_the_old_period_before_a_new_one_starts(): void
    {
        Carbon::setTestNow('2026-09-09 09:00:00');
        $user = User::factory()->create();
        $service = app(WorkSessionService::class);
        $service->markActive($user);

        Carbon::setTestNow('2026-09-09 09:16:00');
        $service->markActive($user);

        $sessions = WorkSession::where('user_id', $user->id)->oldest('started_at')->get();
        $this->assertCount(2, $sessions);
        $this->assertSame('inactive', $sessions[0]->end_reason);
        $this->assertSame('2026-09-09 09:15:00', $sessions[0]->ended_at->format('Y-m-d H:i:s'));
        $this->assertNull($sessions[1]->ended_at);
    }

    public function test_one_device_logging_out_does_not_end_work_while_another_is_active(): void
    {
        $user = User::factory()->create();
        $service = app(WorkSessionService::class);
        $service->markActive($user);

        DB::table('sessions')->insert([
            'id' => 'other-active-device',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Other browser',
            'payload' => 'test-payload',
            'last_activity' => now()->timestamp,
        ]);

        $service->endIfNoOtherActiveDevices($user, 'logout', 'current-device');

        $this->assertNull(WorkSession::where('user_id', $user->id)->sole()->ended_at);
    }

    public function test_stale_sessions_are_closed_at_the_timeout_boundary(): void
    {
        Carbon::setTestNow('2026-09-09 09:00:00');
        $user = User::factory()->create();
        app(WorkSessionService::class)->markActive($user);

        Carbon::setTestNow('2026-09-09 09:20:00');
        $closed = app(WorkSessionService::class)->closeStale();

        $session = WorkSession::where('user_id', $user->id)->sole();
        $this->assertSame(1, $closed);
        $this->assertSame('inactive', $session->end_reason);
        $this->assertSame('2026-09-09 09:15:00', $session->ended_at->format('Y-m-d H:i:s'));
    }

    public function test_employee_sessions_replace_the_separate_login_session_pages(): void
    {
        $routeNames = collect(app('router')->getRoutes()->getRoutes())
            ->map(fn ($route): ?string => $route->getName())
            ->filter();

        $this->assertTrue($routeNames->contains('filament.admin.resources.work-sessions.index'));
        $this->assertFalse($routeNames->contains('filament.admin.resources.login-sessions.index'));
        $this->assertFalse($routeNames->contains('filament.admin.resources.login-events.index'));
    }

    public function test_active_devices_are_counted_on_the_combined_employee_session(): void
    {
        $user = User::factory()->create();
        $workSession = app(WorkSessionService::class)->markActive($user);

        DB::table('sessions')->insert([
            [
                'id' => 'device-one',
                'user_id' => $user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'First browser',
                'payload' => 'test-payload',
                'last_activity' => now()->timestamp,
            ],
            [
                'id' => 'device-two',
                'user_id' => $user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Second browser',
                'payload' => 'test-payload',
                'last_activity' => now()->timestamp,
            ],
        ]);

        $this->assertSame(2, $workSession->active_device_count);
    }
}
