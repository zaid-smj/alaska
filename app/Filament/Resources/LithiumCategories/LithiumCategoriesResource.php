<?php

namespace App\Filament\Resources\LithiumCategories;

use App\Filament\Catalog\ClassificationResource;
use App\Filament\Clusters\Lithium;
use App\Models\Catalog\ProductCategory;

class LithiumCategoriesResource extends ClassificationResource
{
    protected static ?string $model = ProductCategory::class;

    protected static ?string $cluster = Lithium::class;

    protected static ?string $navigationLabel = 'Categories & Order';

    protected static ?string $pluralModelLabel = 'Categories & Order';

    protected static ?int $navigationSort = 3;

    public static string $family = 'lithium-ion';

    protected static ?string $slug = 'categories';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
