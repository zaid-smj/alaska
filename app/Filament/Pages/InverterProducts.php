<?php

namespace App\Filament\Pages;

use App\Filament\Resources\InverterProducts\InverterProductResource;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class InverterProducts extends Page
{
    protected static ?string $title = 'Inverter Products';

    protected static string|UnitEnum|null $navigationGroup = 'Product Catalog';

    protected static ?int $navigationSort = 3;

    protected string $view = 'filament.pages.catalog-coming-soon';

    protected static bool $shouldRegisterNavigation = false;

    public function mount(): void
    {
        $this->redirect(InverterProductResource::getUrl());
    }

    public static function canAccess(): bool
    {
        return Auth::user()?->role?->canManageContent() ?? false;
    }
}
