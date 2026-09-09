<?php

namespace App\Filament\Resources\WorkSessions\Tables;

use App\Models\AuditLog;
use App\Models\LoginEvent;
use App\Models\WorkSession;
use App\Services\AuditLogger;
use App\Services\WorkSessionService;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WorkSessionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('started_at', 'desc')
            ->columns([
                TextColumn::make('user.name')
                    ->label('Administrator')
                    ->description(fn (WorkSession $record): string => $record->user->email)
                    ->searchable(),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'Working' ? 'success' : 'gray'),

                TextColumn::make('started_at')
                    ->label('Started')
                    ->dateTime()
                    ->sortable(),

                TextColumn::make('last_seen_at')
                    ->label('Last active')
                    ->since()
                    ->dateTimeTooltip()
                    ->sortable(),

                TextColumn::make('active_device_count')
                    ->label('Active devices')
                    ->formatStateUsing(fn (int $state): string => $state === 1 ? '1 active' : "{$state} active"),

                TextColumn::make('device_label')
                    ->label('Last device')
                    ->tooltip(fn (WorkSession $record): ?string => $record->user_agent)
                    ->toggleable(),

                TextColumn::make('last_ip_address')
                    ->label('Last IP')
                    ->toggleable(),

                TextColumn::make('ended_at')
                    ->label('Ended')
                    ->dateTime()
                    ->placeholder('Still working')
                    ->sortable(),

                TextColumn::make('duration_label')
                    ->label('Duration'),

                TextColumn::make('end_reason_label')
                    ->label('Ended by')
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('user')
                    ->label('Administrator')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([
                Action::make('forceLogout')
                    ->label('Sign out')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Sign out this administrator?')
                    ->modalDescription('All of their active devices will be signed out and their employee session will end.')
                    ->visible(fn (WorkSession $record): bool => $record->ended_at === null && $record->user_id !== Auth::id())
                    ->action(function (WorkSession $record): void {
                        $revokedCount = DB::table('sessions')->where('user_id', $record->user_id)->delete();

                        LoginEvent::create([
                            'user_id' => $record->user_id,
                            'event' => 'forced_logout',
                            'attempted_email' => $record->user->email,
                            'ip_address' => request()->ip(),
                            'user_agent' => request()->userAgent(),
                        ]);

                        app(WorkSessionService::class)->end($record->user, 'forced_logout');

                        app(AuditLogger::class)->record(
                            'session.revoked_all',
                            "All login sessions for {$record->user->email} were revoked.",
                            $record->user,
                            ['sessions_revoked' => $revokedCount],
                        );

                        Notification::make()
                            ->title("{$record->user->name} has been signed out")
                            ->success()
                            ->send();
                    }),

                ViewAction::make()
                    ->label('Details')
                    ->modalHeading('Employee session details')
                    ->mutateRecordDataUsing(function (array $data, WorkSession $record): array {
                        $activities = AuditLog::where('actor_id', $record->user_id)
                            ->where('created_at', '>=', $record->started_at)
                            ->where('created_at', '<=', $record->ended_at ?? now())
                            ->latest('created_at')
                            ->limit(25)
                            ->get()
                            ->map(fn (AuditLog $entry): string => $entry->created_at
                                ->timezone(config('app.display_timezone'))
                                ->format('g:i A').' — '.$entry->description)
                            ->all();

                        $data['administrator'] = "{$record->user->name} ({$record->user->email})";
                        $data['status'] = $record->status;
                        $data['started_at'] = $record->started_at
                            ->timezone(config('app.display_timezone'))
                            ->format('M j, Y g:i:s A T');
                        $data['ended_at'] = $record->ended_at
                            ?->timezone(config('app.display_timezone'))
                            ->format('M j, Y g:i:s A T') ?? 'Still working';
                        $data['duration'] = $record->duration_label;
                        $data['end_reason'] = $record->end_reason_label;
                        $data['activity'] = $activities === []
                            ? 'No audited administrative changes during this session.'
                            : implode("\n", $activities);

                        return $data;
                    })
                    ->schema([
                        TextInput::make('administrator'),
                        TextInput::make('status'),
                        TextInput::make('started_at')->label('Started'),
                        TextInput::make('ended_at')->label('Ended'),
                        TextInput::make('duration'),
                        TextInput::make('end_reason')->label('Ended by'),
                        TextInput::make('start_ip_address')->label('Starting IP address'),
                        TextInput::make('last_ip_address')->label('Last IP address'),
                        Textarea::make('activity')
                            ->label('Audited work during this session')
                            ->rows(10)
                            ->columnSpanFull(),
                    ]),
            ])
            ->toolbarActions([]);
    }
}
