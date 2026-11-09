<?php

namespace App\Filament\Resources\ProductSections\Pages;

use App\Filament\Catalog\Pages\CreateClassification;
use App\Filament\Resources\ProductSections\ProductSectionResource;

class CreateItem extends CreateClassification
{
    protected static string $resource = ProductSectionResource::class;
}
