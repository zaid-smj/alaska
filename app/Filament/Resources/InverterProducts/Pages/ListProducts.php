<?php

namespace App\Filament\Resources\InverterProducts\Pages;

use App\Filament\Resources\InverterProducts\InverterProductResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProducts extends ListRecords
{
    protected static string $resource = InverterProductResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
