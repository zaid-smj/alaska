<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Models\AdminInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminInvitationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_valid_invitation_displays_the_acceptance_form(): void
    {
        [$invitation, $token] = $this->createInvitation();

        $response = $this->get(route('admin.invitations.accept', $token));

        $response
            ->assertOk()
            ->assertSee('Accept your invitation')
            ->assertSee($invitation->email);
    }

    public function test_an_unknown_invitation_token_is_rejected(): void
    {
        $this->get(route('admin.invitations.accept', 'not-a-real-token'))
            ->assertNotFound()
            ->assertSee('Invitation unavailable');
    }

    public function test_expired_revoked_and_accepted_invitations_are_rejected(): void
    {
        $states = [
            ['expires_at' => now()->subMinute()],
            ['revoked_at' => now()],
            ['accepted_at' => now()],
        ];

        foreach ($states as $index => $state) {
            [, $token] = $this->createInvitation(
                array_merge($state, ['email' => "admin{$index}@example.com"]),
                "invitation-token-{$index}",
            );

            $this->get(route('admin.invitations.accept', $token))
                ->assertNotFound();
        }
    }

    public function test_accepting_an_invitation_creates_an_active_admin_and_consumes_the_invitation(): void
    {
        [$invitation, $token] = $this->createInvitation();
        $password = 'StrongPassword123!';

        $response = $this->post(route('admin.invitations.store', $token), [
            'name' => 'Invited Admin',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response
            ->assertRedirect('/admin')
            ->assertSessionHas('status');

        $user = User::where('email', $invitation->email)->firstOrFail();

        $this->assertSame('Invited Admin', $user->name);
        $this->assertSame(AdminRole::Admin, $user->role);
        $this->assertTrue($user->is_active);
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue(Hash::check($password, $user->password));
        $this->assertNotNull($invitation->fresh()->accepted_at);
    }

    public function test_an_accepted_invitation_cannot_be_reused(): void
    {
        [, $token] = $this->createInvitation();
        $password = 'StrongPassword123!';

        $this->post(route('admin.invitations.store', $token), [
            'name' => 'Invited Admin',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertRedirect('/admin');

        $this->get(route('admin.invitations.accept', $token))
            ->assertNotFound();

        $this->post(route('admin.invitations.store', $token), [
            'name' => 'Another Admin',
            'password' => $password,
            'password_confirmation' => $password,
        ])->assertNotFound();

        $this->assertDatabaseCount('users', 2);
    }

    public function test_an_invitation_cannot_replace_an_account_that_now_uses_the_invited_email(): void
    {
        [$invitation, $token] = $this->createInvitation();
        User::factory()->create(['email' => $invitation->email]);
        $password = 'StrongPassword123!';

        $response = $this->from(route('admin.invitations.accept', $token))
            ->post(route('admin.invitations.store', $token), [
                'name' => 'Invited Admin',
                'password' => $password,
                'password_confirmation' => $password,
            ]);

        $response
            ->assertRedirect(route('admin.invitations.accept', $token))
            ->assertSessionHasErrors('email');

        $this->assertNull($invitation->fresh()->accepted_at);
        $this->assertSame(1, User::where('email', $invitation->email)->count());
    }

    public function test_acceptance_requires_a_strong_confirmed_password(): void
    {
        [$invitation, $token] = $this->createInvitation();

        $response = $this->from(route('admin.invitations.accept', $token))
            ->post(route('admin.invitations.store', $token), [
                'name' => 'Invited Admin',
                'password' => 'weakpassword',
                'password_confirmation' => 'different-password',
            ]);

        $response
            ->assertRedirect(route('admin.invitations.accept', $token))
            ->assertSessionHasErrors('password');

        $this->assertDatabaseMissing('users', ['email' => $invitation->email]);
        $this->assertNull($invitation->fresh()->accepted_at);
    }

    /**
     * @return array{AdminInvitation, string}
     */
    private function createInvitation(array $overrides = [], string $token = 'valid-invitation-token'): array
    {
        $inviter = User::factory()->create();

        $invitation = AdminInvitation::create(array_merge([
            'email' => 'invited@example.com',
            'token_hash' => hash('sha256', $token),
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDay(),
        ], $overrides));

        return [$invitation, $token];
    }
}
