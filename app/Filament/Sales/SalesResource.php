<?php

namespace App\Filament\Sales;

use App\Sales\SalesAccess;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

abstract class SalesResource extends \Filament\Resources\Resource
{
    protected static string|UnitEnum|null $navigationGroup = 'Sales Management';

    public static function canViewAny(): bool
    {
        return SalesAccess::allows(auth()->user());
    }

    public static function canView(Model $record): bool
    {
        return static::canViewAny();
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
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }
}
