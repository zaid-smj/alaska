<?php

namespace App\Filament\Clusters;

use Filament\Clusters\Cluster;
use Filament\Support\Icons\Heroicon;

class Lithium extends Cluster
{
    protected static ?string $navigationLabel = 'Lithium';

    protected static ?string $title = 'Lithium';

    protected static string|\UnitEnum|null $navigationGroup = 'Product Catalog';

    protected static ?int $navigationSort = 3;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedBolt;

    public static function canAccess(): bool
    {
        return (bool) (auth()->user()?->is_active && auth()->user()?->role?->canManageContent());
    }
}
