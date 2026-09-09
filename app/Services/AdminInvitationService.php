<?php

namespace App\Services;

use App\Models\AdminInvitation;
use App\Models\User;
use App\Notifications\AdminInvitationNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminInvitationService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * @return array{invitation: AdminInvitation, token: string}
     */
    public function issue(string $email, User $inviter): array
    {
        $token = Str::random(64);
        $expiresAt = now()->addHours(24);

        $invitation = AdminInvitation::create([
            'email' => strtolower(trim($email)),
            'token_hash' => hash('sha256', $token),
            'invited_by' => $inviter->id,
            'expires_at' => $expiresAt,
        ]);

        $this->deliver($invitation, $token);

        $this->auditLogger->record(
            'invitation.created',
            "Invitation sent to {$invitation->email}.",
            $invitation,
            actor: $inviter,
        );

        return [
            'invitation' => $invitation,
            'token' => $token,
        ];
    }

    /**
     * @return array{invitation: AdminInvitation, token: string}
     */
    public function renew(AdminInvitation $invitation): array
    {
        if ($invitation->accepted_at !== null || User::where('email', $invitation->email)->exists()) {
            throw ValidationException::withMessages([
                'email' => 'This invitation cannot be resent because an account already exists.',
            ]);
        }

        $token = Str::random(64);
        $expiresAt = now()->addHours(24);

        $invitation->update([
            'token_hash' => hash('sha256', $token),
            'expires_at' => $expiresAt,
            'accepted_at' => null,
            'revoked_at' => null,
        ]);

        $this->deliver($invitation, $token);

        $this->auditLogger->record(
            'invitation.resent',
            "Invitation resent to {$invitation->email}.",
            $invitation,
        );

        return [
            'invitation' => $invitation,
            'token' => $token,
        ];
    }

    private function deliver(AdminInvitation $invitation, string $token): void
    {
        Notification::route('mail', $invitation->email)
            ->notify(new AdminInvitationNotification(
                token: $token,
                expiresAt: $invitation->expires_at->format('F j, Y \a\t g:i A T'),
            ));
    }
}
