<?php

namespace App\Filament\Resources\InverterTags;

use App\Filament\Catalog\ClassificationResource;
use App\Filament\Clusters\Inverters;
use App\Models\Catalog\ProductTag;

class InverterTagsResource extends ClassificationResource
{
    protected static ?string $model = ProductTag::class;

    protected static ?string $cluster = Inverters::class;

    protected static ?string $navigationLabel = 'Tags';

    protected static ?string $pluralModelLabel = 'Tags';

    protected static ?int $navigationSort = 4;

    public static string $family = 'inverter';

    protected static ?string $slug = 'tags';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
