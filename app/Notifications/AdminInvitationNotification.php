<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $token,
        public readonly string $expiresAt,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Alaska Admin Portal invitation')
            ->greeting('You have been invited')
            ->line('An administrator invited you to create an account for the Alaska Admin Portal.')
            ->action('Accept invitation', route('admin.invitations.accept', ['token' => $this->token]))
            ->line("This invitation expires {$this->expiresAt}.")
            ->line('If you were not expecting this invitation, you can safely ignore this email.');
    }
}
