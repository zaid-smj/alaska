<?php

namespace App\Filament\Resources\LithiumCategories\Pages;

use App\Filament\Resources\LithiumCategories\LithiumCategoriesResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = LithiumCategoriesResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
