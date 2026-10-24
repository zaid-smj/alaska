<?php

namespace App\Filament\Resources;

use App\Enums\AdminRole;
use App\Filament\Clusters\LeadAcid;
use Filament\Resources\Resource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

abstract class CatalogResource extends Resource
{
    protected static ?string $cluster = LeadAcid::class;

    protected static string|UnitEnum|null $navigationGroup = null;

    public static function canViewAny(): bool
    {
        return in_array(Auth::user()?->role, [AdminRole::SuperAdmin, AdminRole::Admin], true);
    }

    public static function canCreate(): bool
    {
        return static::canViewAny();
    }

    public static function canEdit(Model $record): bool
    {
        return static::canViewAny();
    }

    public static function canDelete(Model $record): bool
    {
        return static::canViewAny();
    }

    public static function canReorder(): bool
    {
        return static::canViewAny();
    }
}
