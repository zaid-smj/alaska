<?php

namespace App\Filament\Resources\Users\Pages;

use App\Enums\AdminRole;
use App\Filament\Resources\Users\UserResource;
use App\Models\AdminInvitation;
use App\Models\User;
use App\Services\AdminInvitationService;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Auth;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('inviteAdmin')
                ->label('Invite Staff')
                ->form([
                    TextInput::make('email')
                        ->label('Email address')
                        ->email()
                        ->required(),
                    Select::make('role')
                        ->options(AdminRole::assignableOptions())
                        ->default(AdminRole::ContentManager->value)
                        ->required(),
                ])
                ->action(function (array $data): void {
                    $email = strtolower(trim($data['email']));

                    if (User::where('email', $email)->exists()) {
                        Notification::make()
                            ->title('Account already exists')
                            ->body('An admin account already exists with this email address.')
                            ->danger()
                            ->send();

                        return;
                    }

                    $existingInvitation = AdminInvitation::where('email', $email)
                        ->whereNull('accepted_at')
                        ->whereNull('revoked_at')
                        ->where('expires_at', '>', now())
                        ->exists();

                    if ($existingInvitation) {
                        Notification::make()
                            ->title('Invitation already pending')
                            ->body('There is already an active invitation for this email address.')
                            ->warning()
                            ->send();

                        return;
                    }

                    $inviter = Auth::user();

                    abort_unless($inviter instanceof User, 403);

                    $issued = app(AdminInvitationService::class)->issue($email, $inviter, AdminRole::from($data['role']));

                    $message = app()->isLocal()
                        ? 'Local invitation URL: '.route('admin.invitations.accept', ['token' => $issued['token']])
                        : 'The invitation email has been sent.';

                    Notification::make()
                        ->title('Staff invitation created')
                        ->body($message)
                        ->success()
                        ->persistent()
                        ->send();
                }),
        ];
    }
}
