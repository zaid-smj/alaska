<?php

namespace App\Filament\Catalog\Pages;

use App\Services\Catalog\ProductEditor;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

abstract class EditCatalogProduct extends EditRecord
{
    protected function mutateFormDataBeforeFill(array $data): array
    {
        return app(ProductEditor::class)->formData($this->record);
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        try {
            return app(ProductEditor::class)->save($record, $data, static::getResource()::$family);
        } catch (ValidationException $exception) {
            throw ValidationException::withMessages(collect($exception->errors())->mapWithKeys(fn ($messages, $key) => ['data.'.($key === 'specs.nominal_energy_wh' ? 'specs.energy_value' : $key) => $messages])->all());
        }
    }

    protected function getHeaderActions(): array
    {
        return [DeleteAction::make()];
    }
}
