<?php

namespace App\Filament\Resources\AdminInvitations\Tables;

use App\Models\AdminInvitation;
use App\Services\AdminInvitationService;
use App\Services\AuditLogger;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AdminInvitationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('inviter.name')
                    ->label('Invited by')
                    ->sortable(),

                TextColumn::make('status')
                    ->state(fn (AdminInvitation $record): string => self::status($record))
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Pending' => 'warning',
                        'Accepted' => 'success',
                        'Revoked' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('expires_at')
                    ->label('Expires')
                    ->dateTime()
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->recordActions([
                Action::make('resend')
                    ->label('Resend')
                    ->requiresConfirmation()
                    ->visible(fn (AdminInvitation $record): bool => $record->accepted_at === null)
                    ->action(function (AdminInvitation $record): void {
                        $issued = app(AdminInvitationService::class)->renew($record);

                        $message = app()->isLocal()
                            ? 'Local invitation URL: '.route('admin.invitations.accept', ['token' => $issued['token']])
                            : 'A replacement invitation email has been sent.';

                        Notification::make()
                            ->title('Invitation resent')
                            ->body($message)
                            ->success()
                            ->persistent()
                            ->send();
                    }),

                Action::make('revoke')
                    ->label('Revoke')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (AdminInvitation $record): bool => $record->accepted_at === null && $record->revoked_at === null)
                    ->action(function (AdminInvitation $record): void {
                        $record->update(['revoked_at' => now()]);

                        app(AuditLogger::class)->record(
                            'invitation.revoked',
                            "Invitation for {$record->email} was revoked.",
                            $record,
                        );

                        Notification::make()
                            ->title('Invitation revoked')
                            ->success()
                            ->send();
                    }),
            ]);
    }

    private static function status(AdminInvitation $invitation): string
    {
        return match (true) {
            $invitation->accepted_at !== null => 'Accepted',
            $invitation->revoked_at !== null => 'Revoked',
            $invitation->expires_at->isPast() => 'Expired',
            default => 'Pending',
        };
    }
}
