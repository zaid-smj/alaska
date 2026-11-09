<?php

namespace App\Filament\Resources\LithiumBanners;

use App\Filament\Clusters\Lithium;
use App\Filament\Resources\CatalogBanners\CatalogBannerResource;

class LithiumBannerResource extends CatalogBannerResource
{
    protected static ?string $cluster = Lithium::class;

    protected static ?string $slug = 'page-banner';

    public static string $family = 'lithium-ion';

    public static function getPages(): array
    {
        return ['index' => Pages\ListBanners::route('/'), 'edit' => Pages\EditBanner::route('/{record}/edit')];
    }
}
