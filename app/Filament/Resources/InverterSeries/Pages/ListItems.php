<?php

namespace App\Filament\Resources\InverterSeries\Pages;

use App\Filament\Resources\InverterSeries\InverterSeriesResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = InverterSeriesResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
