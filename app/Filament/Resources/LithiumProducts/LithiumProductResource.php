<?php

namespace App\Filament\Resources\LithiumProducts;

use App\Filament\Catalog\FamilyProductResource;
use App\Filament\Clusters\Lithium;

class LithiumProductResource extends FamilyProductResource
{
    protected static ?string $cluster = Lithium::class;

    protected static ?string $pluralModelLabel = 'Lithium products';

    public static string $family = 'lithium-ion';

    public static function getPages(): array
    {
        return ['index' => Pages\ListProducts::route('/'), 'create' => Pages\CreateProduct::route('/create'), 'edit' => Pages\EditProduct::route('/{record}/edit')];
    }
}
