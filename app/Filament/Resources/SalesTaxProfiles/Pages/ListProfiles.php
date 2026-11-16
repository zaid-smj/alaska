<?php

namespace App\Filament\Resources\SalesTaxProfiles\Pages;

use App\Filament\Resources\SalesTaxProfiles\SalesTaxProfileResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProfiles extends ListRecords
{
    protected static string $resource = SalesTaxProfileResource::class;

    protected function getHeaderActions(): array
    {
        return static::getResource()::canCreate() ? [CreateAction::make()] : [];
    }
}
