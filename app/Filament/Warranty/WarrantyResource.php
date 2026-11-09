<?php

namespace App\Filament\Warranty;

use App\Warranty\WarrantyAccess;
use Filament\Resources\Resource;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

abstract class WarrantyResource extends Resource
{
    protected static string|UnitEnum|null $navigationGroup = 'Warranty Management';

    public static function canViewAny(): bool
    {
        return WarrantyAccess::allows(auth()->user());
    }

    public static function canView(Model $record): bool
    {
        return static::canViewAny();
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }
}
