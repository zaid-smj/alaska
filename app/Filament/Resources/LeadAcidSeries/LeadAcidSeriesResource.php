<?php

namespace App\Filament\Resources\LeadAcidSeries;

use App\Filament\Catalog\ClassificationResource;
use App\Filament\Clusters\LeadAcid;
use App\Models\Catalog\ProductSeries;

class LeadAcidSeriesResource extends ClassificationResource
{
    protected static ?string $model = ProductSeries::class;

    protected static ?string $cluster = LeadAcid::class;

    protected static ?string $navigationLabel = 'Series';

    protected static ?string $pluralModelLabel = 'Series';

    protected static ?int $navigationSort = 2;

    public static string $family = 'lead-acid';

    protected static ?string $slug = 'series';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
