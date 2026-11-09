<?php

namespace App\Filament\Catalog\Pages;

use Filament\Resources\Pages\EditRecord;

abstract class EditClassification extends EditRecord
{
    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['family'] = static::getResource()::$family;

        return $data;
    }
}
