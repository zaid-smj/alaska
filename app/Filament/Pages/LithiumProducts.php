<?php

namespace App\Filament\Pages;

use App\Filament\Resources\LithiumProducts\LithiumProductResource;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class LithiumProducts extends Page
{
    protected static ?string $title = 'Lithium Products';

    protected static string|UnitEnum|null $navigationGroup = 'Product Catalog';

    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.catalog-coming-soon';

    protected static bool $shouldRegisterNavigation = false;

    public function mount(): void
    {
        $this->redirect(LithiumProductResource::getUrl());
    }

    public static function canAccess(): bool
    {
        return Auth::user()?->role?->canManageContent() ?? false;
    }
}
