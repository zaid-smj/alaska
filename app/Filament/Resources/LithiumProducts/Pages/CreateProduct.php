<?php

namespace App\Filament\Resources\LithiumProducts\Pages;

use App\Filament\Catalog\Pages\CreateCatalogProduct;
use App\Filament\Resources\LithiumProducts\LithiumProductResource;

class CreateProduct extends CreateCatalogProduct
{
    protected static string $resource = LithiumProductResource::class;
}
