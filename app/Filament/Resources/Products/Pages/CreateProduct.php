<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Services\AuditLogger;
use Filament\Resources\Pages\CreateRecord;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['type'] = 'lead-acid';

        return $data;
    }

    protected function afterCreate(): void
    {
        app(AuditLogger::class)->record('content.catalog.product.sections.saved', 'Product section assignments were saved.', $this->record, ['section_ids' => $this->record->sections()->pluck('product_sections.id')->all()]);
    }
}
