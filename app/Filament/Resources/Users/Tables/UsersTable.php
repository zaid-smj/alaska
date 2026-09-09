<?php

namespace App\Filament\Resources\Users\Tables;

use App\Models\LoginEvent;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\WorkSessionService;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('role')
                    ->badge()
                    ->sortable(),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
                Action::make('revokeSessions')
                    ->label('Sign out everywhere')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (User $record): bool => $record->id !== Auth::id()
                        && DB::table('sessions')->where('user_id', $record->id)->exists())
                    ->action(function (User $record): void {
                        $revokedCount = DB::table('sessions')->where('user_id', $record->id)->delete();

                        LoginEvent::create([
                            'user_id' => $record->id,
                            'event' => 'forced_logout',
                            'attempted_email' => $record->email,
                            'ip_address' => request()->ip(),
                            'user_agent' => request()->userAgent(),
                        ]);

                        app(WorkSessionService::class)->end($record, 'forced_logout');

                        app(AuditLogger::class)->record(
                            'session.revoked_all',
                            "All login sessions for {$record->email} were revoked.",
                            $record,
                            ['sessions_revoked' => $revokedCount],
                        );

                        Notification::make()
                            ->title("{$record->name} has been signed out")
                            ->success()
                            ->send();
                    }),
            ]);
    }
}
