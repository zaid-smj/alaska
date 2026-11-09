<?php

namespace App\Filament\Resources\ProductSections\Pages;

use App\Filament\Catalog\Pages\EditClassification;
use App\Filament\Resources\ProductSections\ProductSectionResource;

class EditItem extends EditClassification
{
    protected static string $resource = ProductSectionResource::class;
}
