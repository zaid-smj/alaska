<?php

namespace App\Filament\Catalog\Pages;

use App\Models\Product;
use App\Services\Catalog\ProductEditor;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

abstract class CreateCatalogProduct extends CreateRecord
{
    protected function handleRecordCreation(array $data): Model
    {
        try {
            return app(ProductEditor::class)->save(new Product, $data, static::getResource()::$family);
        } catch (ValidationException $exception) {
            throw ValidationException::withMessages(collect($exception->errors())->mapWithKeys(fn ($messages, $key) => ['data.'.($key === 'specs.nominal_energy_wh' ? 'specs.energy_value' : $key) => $messages])->all());
        }
    }
}
