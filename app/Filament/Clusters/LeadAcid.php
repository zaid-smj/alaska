<?php

namespace App\Filament\Clusters;

use App\Enums\AdminRole;
use BackedEnum;
use Filament\Clusters\Cluster;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class LeadAcid extends Cluster
{
    protected static ?string $navigationLabel = 'Lead Acid Products';

    protected static ?string $title = 'Lead Acid';

    protected static string|UnitEnum|null $navigationGroup = 'Product Catalog';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBolt;

    protected static ?int $navigationSort = 1;

    public static function canAccess(): bool
    {
        return in_array(Auth::user()?->role, [AdminRole::SuperAdmin, AdminRole::Admin], true);
    }
}
