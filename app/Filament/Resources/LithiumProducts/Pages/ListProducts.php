<?php

namespace App\Filament\Resources\LithiumProducts\Pages;

use App\Filament\Resources\LithiumProducts\LithiumProductResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProducts extends ListRecords
{
    protected static string $resource = LithiumProductResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
