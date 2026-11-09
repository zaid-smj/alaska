<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Catalog\Pages\CreateCatalogProduct;
use App\Filament\Resources\Products\ProductResource;

class CreateProduct extends CreateCatalogProduct
{
    protected static string $resource = ProductResource::class;
}
