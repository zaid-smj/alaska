<?php

namespace App\Filament\Resources\InverterSeries;

use App\Filament\Catalog\ClassificationResource;
use App\Filament\Clusters\Inverters;
use App\Models\Catalog\ProductSeries;

class InverterSeriesResource extends ClassificationResource
{
    protected static ?string $model = ProductSeries::class;

    protected static ?string $cluster = Inverters::class;

    protected static ?string $navigationLabel = 'Series';

    protected static ?string $pluralModelLabel = 'Series';

    protected static ?int $navigationSort = 2;

    public static string $family = 'inverter';

    protected static ?string $slug = 'series';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
