<?php

namespace App\Filament\Resources\Products;

use App\Filament\Catalog\FamilyProductResource;

class ProductResource extends FamilyProductResource
{
    protected static ?string $modelLabel = 'Lead Acid product';

    protected static ?string $pluralModelLabel = 'Lead Acid products';

    public static function getPages(): array
    {
        return ['index' => Pages\ListProducts::route('/'), 'create' => Pages\CreateProduct::route('/create'), 'edit' => Pages\EditProduct::route('/{record}/edit')];
    }
}
