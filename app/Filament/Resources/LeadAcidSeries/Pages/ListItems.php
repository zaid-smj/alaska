<?php

namespace App\Filament\Resources\LeadAcidSeries\Pages;

use App\Filament\Resources\LeadAcidSeries\LeadAcidSeriesResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = LeadAcidSeriesResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
