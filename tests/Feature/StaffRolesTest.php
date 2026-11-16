<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\AdminInvitations\AdminInvitationResource;
use App\Filament\Resources\AuditLogs\AuditLogResource;
use App\Filament\Resources\GalleryImages\GalleryImageResource;
use App\Filament\Resources\HomeBannerSlides\HomeBannerSlideResource;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Filament\Resources\Users\UserResource;
use App\Filament\Resources\WorkSessions\WorkSessionResource;
use App\Models\User;
use App\Services\AdminInvitationService;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Livewire\Livewire;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class StaffRolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_have_separate_cms_sales_and_staff_permissions(): void
    {
        foreach (AdminRole::cases() as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->actingAs($user);
            $this->assertTrue($user->canAccessPanel(Filament::getPanel('admin')));
            $this->assertSame($role !== AdminRole::Sales, HomeBannerSlideResource::canCreate());
            $this->assertSame($role !== AdminRole::Sales, GalleryImageResource::canCreate());
            foreach ([UserResource::class, AdminInvitationResource::class, AuditLogResource::class, WorkSessionResource::class] as $resource) {
                $allowed = in_array($role, [AdminRole::SuperAdmin, AdminRole::Admin], true);
                $this->assertSame($allowed, $resource::canViewAny());
            }
        }
    }

    public function test_super_admin_can_invite_content_manager_and_acceptance_ignores_submitted_role(): void
    {
        Notification::fake();
        $super = User::factory()->create(['role' => AdminRole::SuperAdmin]);
        $this->actingAs($super);
        Livewire::test(ListUsers::class)
            ->callAction('inviteAdmin', data: ['email' => 'editor@example.com', 'role' => 'marketing'])
            ->assertHasNoActionErrors();
        $this->assertDatabaseHas('admin_invitations', ['email' => 'editor@example.com', 'role' => 'marketing']);

        $issued = app(AdminInvitationService::class)->issue('another-editor@example.com', $super, AdminRole::ContentManager);
        auth()->logout();
        $this->post(route('admin.invitations.store', $issued['token']), [
            'name' => 'Editor', 'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!', 'role' => 'super_admin',
        ])->assertRedirect('/admin');
        $this->assertSame(AdminRole::ContentManager, User::where('email', 'another-editor@example.com')->firstOrFail()->role);
    }

    public function test_marketing_and_sales_cannot_issue_invitations_even_through_service(): void
    {
        Notification::fake();
        foreach ([AdminRole::Marketing, AdminRole::Sales] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->actingAs($user);
            Livewire::test(ListUsers::class)->assertForbidden();
            try {
                app(AdminInvitationService::class)->issue('blocked@example.com', $user);
                $this->fail('Invitation should have been forbidden.');
            } catch (HttpException $e) {
                $this->assertSame(403, $e->getStatusCode());
            }
        }
        $this->assertDatabaseCount('admin_invitations', 0);
        Notification::assertNothingSent();
    }

    public function test_only_super_admin_can_change_staff_roles(): void
    {
        $super = User::factory()->create(['role' => AdminRole::SuperAdmin]);
        $editor = User::factory()->create(['role' => AdminRole::ContentManager]);
        $this->actingAs($super);
        Livewire::test(EditUser::class, ['record' => $editor->getRouteKey()])
            ->fillForm(['role' => 'admin'])->call('save')->assertHasNoFormErrors();
        $this->assertSame(AdminRole::Admin, $editor->fresh()->role);
        Livewire::test(EditUser::class, ['record' => $editor->getRouteKey()])
            ->fillForm(['role' => 'marketing'])->call('save')->assertHasNoFormErrors();
        $this->assertSame(AdminRole::ContentManager, $editor->fresh()->role);
        $this->actingAs($editor->fresh());
        Livewire::test(EditUser::class, ['record' => $super->getRouteKey()])->assertForbidden();
    }
}
