<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Services\AuditLogger;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [DeleteAction::make()];
    }

    protected function afterSave(): void
    {
        app(AuditLogger::class)->record('content.catalog.product.sections.saved', 'Product section assignments were saved.', $this->record, ['section_ids' => $this->record->sections()->pluck('product_sections.id')->all()]);
    }
}
