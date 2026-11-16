<?php

namespace App\Filament\Pages;

use App\Sales\SalesAccess;
use App\Services\Sales\SalesReports;
use Filament\Pages\Page;
use UnitEnum;

class SalesOverview extends Page
{
    protected static string|UnitEnum|null $navigationGroup = 'Sales Management';

    protected static ?string $navigationLabel = 'Overview';

    protected static ?string $title = 'Sales Overview';

    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.sales-overview';

    public string $period = 'day';

    public ?string $from = null;

    public ?string $until = null;

    public static function canAccess(): bool
    {
        return SalesAccess::allows(auth()->user());
    }

    protected function getViewData(): array
    {
        SalesAccess::authorize();

        return ['report' => app(SalesReports::class)->summarize($this->from, $this->until, $this->period)];
    }
}
