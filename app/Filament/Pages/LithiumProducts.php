<?php

namespace App\Filament\Pages;

use App\Enums\AdminRole;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class LithiumProducts extends Page
{
    protected static ?string $title = 'Lithium Products';

    protected static string|UnitEnum|null $navigationGroup = 'Product Catalog';

    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.catalog-coming-soon';

    public static function canAccess(): bool
    {
        return in_array(Auth::user()?->role, [AdminRole::SuperAdmin, AdminRole::Admin], true);
    }
}
