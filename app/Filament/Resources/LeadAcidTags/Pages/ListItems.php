<?php

namespace App\Filament\Resources\LeadAcidTags\Pages;

use App\Filament\Resources\LeadAcidTags\LeadAcidTagResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListItems extends ListRecords
{
    protected static string $resource = LeadAcidTagResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
