<?php

namespace App\Filament\Resources\WorkSessions\Pages;

use App\Filament\Resources\WorkSessions\WorkSessionResource;
use App\Services\WorkSessionService;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListWorkSessions extends ListRecords
{
    protected static string $resource = WorkSessionResource::class;

    public function mount(): void
    {
        parent::mount();

        app(WorkSessionService::class)->closeStale();
    }

    public function getTabs(): array
    {
        return [
            'working' => Tab::make('Working now')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->whereNull('ended_at'))
                ->badge(fn (): int => static::getResource()::getEloquentQuery()->whereNull('ended_at')->count())
                ->badgeColor('success'),

            'history' => Tab::make('Session history')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->whereNotNull('ended_at')),
        ];
    }
}
