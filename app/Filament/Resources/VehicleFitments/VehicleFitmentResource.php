<?php

namespace App\Filament\Resources\VehicleFitments;

use App\Filament\Catalog\VehicleResource;
use App\Models\Vehicles\VehicleFitment;

class VehicleFitmentResource extends VehicleResource
{
    protected static ?string $model = VehicleFitment::class;

    protected static ?string $navigationLabel = 'Years & Compatibility';

    protected static ?string $pluralModelLabel = 'Years & Compatibility';

    public static function getPages(): array
    {
        return ['index' => Pages\ListItems::route('/'), 'create' => Pages\CreateItem::route('/create'), 'edit' => Pages\EditItem::route('/{record}/edit')];
    }
}
