<?php

namespace App\Filament\Catalog\Pages;

use Filament\Resources\Pages\CreateRecord;

abstract class CreateClassification extends CreateRecord
{
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['family'] = static::getResource()::$family;

        return $data;
    }
}
