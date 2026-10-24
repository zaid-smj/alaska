<?php

namespace App\Filament\Resources\ProductSections\Pages;

use App\Filament\Resources\ProductSections\ProductSectionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProductSections extends ListRecords
{
    protected static string $resource = ProductSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
