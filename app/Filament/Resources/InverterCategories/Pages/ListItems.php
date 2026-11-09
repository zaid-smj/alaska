<?php

namespace App\Filament\Resources\InverterCategories\Pages;

use App\Filament\Resources\InverterCategories\InverterCategoriesResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = InverterCategoriesResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
