<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Catalog\Pages\EditCatalogProduct;
use App\Filament\Resources\Products\ProductResource;

class EditProduct extends EditCatalogProduct
{
    protected static string $resource = ProductResource::class;
}
