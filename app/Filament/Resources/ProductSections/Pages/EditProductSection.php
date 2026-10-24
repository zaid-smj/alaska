<?php

namespace App\Filament\Resources\ProductSections\Pages;

use App\Filament\Resources\ProductSections\ProductSectionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProductSection extends EditRecord
{
    protected static string $resource = ProductSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [DeleteAction::make()->modalDescription('All products in this section will become drafts, even when shared with another section. Products are preserved.')];
    }
}
