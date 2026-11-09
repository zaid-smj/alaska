<?php

namespace App\Filament\Resources\LithiumSeries\Pages;

use App\Filament\Resources\LithiumSeries\LithiumSeriesResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = LithiumSeriesResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
