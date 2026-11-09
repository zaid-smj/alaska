<?php

namespace App\Filament\Resources\VehicleModels;

use App\Filament\Catalog\VehicleResource;
use App\Models\Vehicles\VehicleModel;

class VehicleModelResource extends VehicleResource
{
    protected static ?string $model = VehicleModel::class;

    protected static ?string $navigationLabel = 'Vehicle Models';

    protected static ?string $pluralModelLabel = 'Vehicle Models';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
