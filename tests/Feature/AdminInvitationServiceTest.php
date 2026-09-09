<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AdminInvitationNotification;
use App\Services\AdminInvitationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminInvitationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_issuing_an_invitation_stores_only_the_token_hash_and_sends_email(): void
    {
        Notification::fake();
        $inviter = User::factory()->create();

        $issued = app(AdminInvitationService::class)->issue(' NewAdmin@Example.com ', $inviter);

        $invitation = $issued['invitation'];
        $token = $issued['token'];

        $this->assertSame('newadmin@example.com', $invitation->email);
        $this->assertSame(hash('sha256', $token), $invitation->token_hash);
        $this->assertNotSame($token, $invitation->token_hash);
        $this->assertTrue($invitation->expires_at->isFuture());

        Notification::assertSentOnDemand(
            AdminInvitationNotification::class,
            function (AdminInvitationNotification $notification, array $channels, AnonymousNotifiable $notifiable) use ($token): bool {
                return $notification->token === $token
                    && $channels === ['mail']
                    && $notifiable->routes['mail'] === 'newadmin@example.com';
            },
        );
    }

    public function test_the_email_contains_the_acceptance_link_and_expiration_notice(): void
    {
        $notification = new AdminInvitationNotification(
            token: 'email-test-token',
            expiresAt: 'September 10, 2026 at 4:00 PM UTC',
        );

        $message = $notification->toMail(new AnonymousNotifiable);

        $this->assertSame('Your Alaska Admin Portal invitation', $message->subject);
        $this->assertSame('Accept invitation', $message->actionText);
        $this->assertStringContainsString('email-test-token', $message->actionUrl);
        $this->assertStringContainsString(
            'September 10, 2026',
            implode(' ', [...$message->introLines, ...$message->outroLines]),
        );
    }

    public function test_renewing_an_invitation_rotates_the_token_and_restores_pending_state(): void
    {
        Notification::fake();
        $inviter = User::factory()->create();
        $issued = app(AdminInvitationService::class)->issue('invited@example.com', $inviter);
        $invitation = $issued['invitation'];
        $originalToken = $issued['token'];

        $invitation->update([
            'expires_at' => now()->subHour(),
            'revoked_at' => now()->subMinute(),
        ]);

        $renewed = app(AdminInvitationService::class)->renew($invitation->fresh());
        $refreshed = $invitation->fresh();

        $this->assertNotSame($originalToken, $renewed['token']);
        $this->assertSame(hash('sha256', $renewed['token']), $refreshed->token_hash);
        $this->assertNull($refreshed->revoked_at);
        $this->assertNull($refreshed->accepted_at);
        $this->assertTrue($refreshed->expires_at->isFuture());
        Notification::assertSentOnDemandTimes(AdminInvitationNotification::class, 2);
    }
}
