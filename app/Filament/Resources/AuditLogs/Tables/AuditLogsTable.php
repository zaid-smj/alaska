<?php

namespace App\Filament\Resources\AuditLogs\Tables;

use App\Models\AuditLog;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class AuditLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')
                    ->label('When')
                    ->since()
                    ->dateTimeTooltip()
                    ->sortable(),

                TextColumn::make('actor.name')
                    ->label('Performed by')
                    ->placeholder('System / public')
                    ->description(fn (AuditLog $record): ?string => $record->actor?->email)
                    ->searchable(),

                TextColumn::make('event')
                    ->label('Activity')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => self::eventLabel($state))
                    ->color(fn (string $state): string => match ($state) {
                        'invitation.revoked', 'session.revoked',
                        'session.revoked_all', 'security.mfa_reset' => 'danger',
                        'invitation.accepted' => 'success',
                        default => 'gray',
                    })
                    ->searchable(),

                TextColumn::make('description')
                    ->wrap()
                    ->searchable(),

                TextColumn::make('ip_address')
                    ->label('IP address')
                    ->placeholder('Server action')
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('event')
                    ->label('Activity')
                    ->multiple()
                    ->options(self::eventOptions()),

                SelectFilter::make('actor')
                    ->label('Performed by')
                    ->relationship('actor', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([
                ViewAction::make()
                    ->label('Details')
                    ->modalHeading('Audit entry details')
                    ->mutateRecordDataUsing(function (array $data, AuditLog $record): array {
                        $data['performed_by'] = $record->actor
                            ? "{$record->actor->name} ({$record->actor->email})"
                            : 'System / public';
                        $data['event'] = self::eventLabel($record->event);
                        $data['created_at'] = $record->created_at->format('M j, Y g:i:s A T');
                        $data['metadata'] = $record->metadata
                            ? json_encode($record->metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
                            : 'No additional details';

                        return $data;
                    })
                    ->schema([
                        TextInput::make('created_at')->label('When'),
                        TextInput::make('performed_by')->label('Performed by'),
                        TextInput::make('event')->label('Activity'),
                        TextInput::make('ip_address')->label('IP address')->placeholder('Server action'),
                        Textarea::make('description')->rows(2)->columnSpanFull(),
                        Textarea::make('metadata')
                            ->label('Change details')
                            ->rows(8)
                            ->columnSpanFull(),
                        Textarea::make('user_agent')
                            ->label('Device / browser details')
                            ->rows(3)
                            ->placeholder('Server action')
                            ->columnSpanFull(),
                    ]),
            ])
            ->toolbarActions([]);
    }

    /**
     * @return array<string, string>
     */
    private static function eventOptions(): array
    {
        $events = [
            'admin.created',
            'admin.updated',
            'invitation.created',
            'invitation.resent',
            'invitation.revoked',
            'invitation.accepted',
            'session.revoked',
            'session.revoked_all',
            'security.mfa_reset',
        ];

        return collect($events)
            ->mapWithKeys(fn (string $event): array => [$event => self::eventLabel($event)])
            ->all();
    }

    private static function eventLabel(string $event): string
    {
        return match ($event) {
            'admin.created' => 'Admin created',
            'admin.updated' => 'Admin updated',
            'invitation.created' => 'Invitation sent',
            'invitation.resent' => 'Invitation resent',
            'invitation.revoked' => 'Invitation revoked',
            'invitation.accepted' => 'Invitation accepted',
            'session.revoked' => 'Session revoked',
            'session.revoked_all' => 'All sessions revoked',
            'security.mfa_reset' => 'MFA reset',
            default => str($event)->replace('.', ' ')->headline()->toString(),
        };
    }
}
