<?php

namespace App\Filament\Resources\InverterBanners;

use App\Filament\Clusters\Inverters;
use App\Filament\Resources\CatalogBanners\CatalogBannerResource;

class InverterBannerResource extends CatalogBannerResource
{
    protected static ?string $cluster = Inverters::class;

    protected static ?string $slug = 'page-banner';

    public static string $family = 'inverter';

    public static function getPages(): array
    {
        return ['index' => Pages\ListBanners::route('/'), 'edit' => Pages\EditBanner::route('/{record}/edit')];
    }
}
