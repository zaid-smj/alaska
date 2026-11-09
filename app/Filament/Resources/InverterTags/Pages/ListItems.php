<?php

namespace App\Filament\Resources\InverterTags\Pages;

use App\Filament\Resources\InverterTags\InverterTagsResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = InverterTagsResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
