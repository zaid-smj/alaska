<?php

namespace App\Filament\Resources\VehicleFitments\Pages;

use App\Filament\Resources\VehicleFitments\VehicleFitmentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = VehicleFitmentResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
