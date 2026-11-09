<?php

namespace App\Filament\Resources\InverterProducts;

use App\Filament\Catalog\FamilyProductResource;
use App\Filament\Clusters\Inverters;

class InverterProductResource extends FamilyProductResource
{
    protected static ?string $cluster = Inverters::class;

    protected static ?string $pluralModelLabel = 'Inverters products';

    public static string $family = 'inverter';

    public static function getPages(): array
    {
        return ['index' => Pages\ListProducts::route('/'), 'create' => Pages\CreateProduct::route('/create'), 'edit' => Pages\EditProduct::route('/{record}/edit')];
    }
}
