<?php

namespace App\Filament\Resources\LithiumTags\Pages;

use App\Filament\Resources\LithiumTags\LithiumTagsResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = LithiumTagsResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
