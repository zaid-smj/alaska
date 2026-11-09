<?php

namespace App\Filament\Resources\LithiumProducts\Pages;

use App\Filament\Catalog\Pages\EditCatalogProduct;
use App\Filament\Resources\LithiumProducts\LithiumProductResource;

class EditProduct extends EditCatalogProduct
{
    protected static string $resource = LithiumProductResource::class;
}
