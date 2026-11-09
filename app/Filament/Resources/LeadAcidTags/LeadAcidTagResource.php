<?php

namespace App\Filament\Resources\LeadAcidTags;

use App\Filament\Catalog\ClassificationResource;
use App\Filament\Clusters\LeadAcid;
use App\Models\Catalog\ProductTag;

class LeadAcidTagResource extends ClassificationResource
{
    protected static ?string $model = ProductTag::class;

    protected static ?string $cluster = LeadAcid::class;

    protected static ?string $navigationLabel = 'Tags';

    protected static ?string $pluralModelLabel = 'Tags';

    protected static ?int $navigationSort = 4;

    public static string $family = 'lead-acid';

    protected static ?string $slug = 'tags';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
