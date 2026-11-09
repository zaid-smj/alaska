<?php

namespace App\Filament\Resources\VehicleMakes;

use App\Filament\Catalog\VehicleResource;
use App\Models\Vehicles\VehicleMake;

class VehicleMakeResource extends VehicleResource
{
    protected static ?string $model = VehicleMake::class;

    protected static ?string $navigationLabel = 'Vehicle Makes';

    protected static ?string $pluralModelLabel = 'Vehicle Makes';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
