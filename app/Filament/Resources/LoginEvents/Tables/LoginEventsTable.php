<?php

namespace App\Filament\Resources\LoginEvents\Tables;

use App\Models\LoginEvent;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class LoginEventsTable
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

                TextColumn::make('account_label')
                    ->label('Administrator')
                    ->description(fn (LoginEvent $record): ?string => $record->account_email)
                    ->searchable(['attempted_email']),

                TextColumn::make('event')
                    ->label('Activity')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'login' => 'Signed in',
                        'logout' => 'Signed out',
                        default => 'Failed sign-in',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'login' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('ip_address')
                    ->label('IP address')
                    ->placeholder('Unknown'),

                TextColumn::make('device_label')
                    ->label('Device / browser')
                    ->tooltip(fn (LoginEvent $record): ?string => $record->user_agent),
            ])
            ->filters([
                SelectFilter::make('event')
                    ->label('Activity')
                    ->options([
                        'login' => 'Signed in',
                        'logout' => 'Signed out',
                        'failed' => 'Failed sign-in',
                    ]),

                SelectFilter::make('user')
                    ->label('Administrator')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([])
            ->toolbarActions([]);
    }
}
