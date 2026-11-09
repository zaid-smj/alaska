<?php

namespace App\Filament\Resources\ProductSections;

use App\Filament\Catalog\ClassificationResource;
use App\Filament\Clusters\LeadAcid;
use App\Models\Catalog\ProductCategory;

class ProductSectionResource extends ClassificationResource
{
    protected static ?string $model = ProductCategory::class;

    protected static ?string $cluster = LeadAcid::class;

    protected static ?string $navigationLabel = 'Categories & Order';

    protected static ?string $pluralModelLabel = 'Categories & Order';

    protected static ?int $navigationSort = 3;

    public static string $family = 'lead-acid';

    protected static ?string $slug = 'product-sections';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
