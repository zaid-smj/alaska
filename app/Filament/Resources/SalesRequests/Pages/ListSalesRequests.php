<?php

namespace App\Filament\Resources\SalesRequests\Pages;

use App\Filament\Resources\SalesRequests\SalesRequestResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;

class ListSalesRequests extends ListRecords
{
    protected static string $resource = SalesRequestResource::class;

    public function getTabs(): array
    {
        return ['all' => Tab::make('All requests'), 'quotes' => Tab::make('Quote requests')->modifyQueryUsing(fn ($q) => $q->where('request_kind', 'quote')), 'checkout' => Tab::make('Checkout orders')->modifyQueryUsing(fn ($q) => $q->where('request_kind', 'checkout')), 'new' => Tab::make('New Sales')->modifyQueryUsing(fn ($q) => $q->where('status', 'new')), 'pending' => Tab::make('Pending Sales')->modifyQueryUsing(fn ($q) => $q->whereNotIn('status', ['new', 'completed', 'closed', 'declined', 'returned', 'cancelled', 'refunded'])), 'completed' => Tab::make('Completed Sales')->modifyQueryUsing(fn ($q) => $q->where('status', 'completed')), 'cancelled' => Tab::make('Other closed outcomes')->modifyQueryUsing(fn ($q) => $q->whereIn('status', ['closed', 'declined', 'returned', 'cancelled', 'refunded']))];
    }
}
