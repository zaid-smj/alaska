<?php

namespace App\Filament\Resources\InverterProducts\Pages;

use App\Filament\Catalog\Pages\CreateCatalogProduct;
use App\Filament\Resources\InverterProducts\InverterProductResource;

class CreateProduct extends CreateCatalogProduct
{
    protected static string $resource = InverterProductResource::class;
}
