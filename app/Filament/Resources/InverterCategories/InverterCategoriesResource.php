<?php

namespace App\Filament\Resources\InverterCategories;

use App\Filament\Catalog\ClassificationResource;
use App\Filament\Clusters\Inverters;
use App\Models\Catalog\ProductCategory;

class InverterCategoriesResource extends ClassificationResource
{
    protected static ?string $model = ProductCategory::class;

    protected static ?string $cluster = Inverters::class;

    protected static ?string $navigationLabel = 'Categories & Order';

    protected static ?string $pluralModelLabel = 'Categories & Order';

    protected static ?int $navigationSort = 3;

    public static string $family = 'inverter';

    protected static ?string $slug = 'categories';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
