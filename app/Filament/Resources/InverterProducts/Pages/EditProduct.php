<?php

namespace App\Filament\Resources\InverterProducts\Pages;

use App\Filament\Catalog\Pages\EditCatalogProduct;
use App\Filament\Resources\InverterProducts\InverterProductResource;

class EditProduct extends EditCatalogProduct
{
    protected static string $resource = InverterProductResource::class;
}
