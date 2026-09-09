<?php

namespace App\Filament\Resources\LoginSessions\Tables;

use App\Models\LoginSession;
use App\Services\AuditLogger;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class LoginSessionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('last_activity', 'desc')
            ->columns([
                TextColumn::make('user.name')
                    ->label('Administrator')
                    ->searchable(),

                TextColumn::make('user.email')
                    ->label('Email address')
                    ->searchable(),

                TextColumn::make('ip_address')
                    ->label('IP address'),

                TextColumn::make('device_label')
                    ->label('Device / browser')
                    ->tooltip(fn (LoginSession $record): ?string => $record->user_agent),

                TextColumn::make('presence_status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'Online' ? 'success' : 'warning'),

                TextColumn::make('last_activity')
                    ->label('Last seen')
                    ->since()
                    ->dateTimeTooltip()
                    ->sortable(),
            ])
            ->recordActions([
                Action::make('revoke')
                    ->label('Sign out')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (LoginSession $record): bool => $record->id !== session()->getId())
                    ->action(function (LoginSession $record): void {
                        $user = $record->user;
                        $metadata = [
                            'session_id' => $record->id,
                            'ip_address' => $record->ip_address,
                            'device' => $record->device_label,
                        ];
                        $record->delete();

                        app(AuditLogger::class)->record(
                            'session.revoked',
                            "Login session for {$user->email} was revoked.",
                            $user,
                            $metadata,
                        );

                        Notification::make()
                            ->title('Login session revoked')
                            ->success()
                            ->send();
                    }),
            ]);
    }
}
