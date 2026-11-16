<?php

namespace App\Filament\Pages;

use UnitEnum;

class CmsReport extends MarketingOverview
{
    protected static string|UnitEnum|null $navigationGroup = 'Content Management';

    protected static ?string $navigationLabel = 'CMS Reports';
}
