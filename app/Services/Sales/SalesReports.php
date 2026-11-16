<?php

namespace App\Services\Sales;

use App\Models\Sales\SalesRequest;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

class SalesReports
{
    public function summarize(?string $from = null, ?string $until = null, string $period = 'day'): array
    {
        validator(compact('from', 'until', 'period'), ['from' => ['nullable', 'date_format:Y-m-d'], 'until' => ['nullable', 'date_format:Y-m-d', Rule::when(filled($from), 'after_or_equal:from')], 'period' => ['in:day,week,month,year']])->validate();
        $query = SalesRequest::query()->when($from, fn ($q) => $q->where('created_at', '>=', Carbon::parse($from, config('app.display_timezone'))->startOfDay()->utc()))->when($until, fn ($q) => $q->where('created_at', '<=', Carbon::parse($until, config('app.display_timezone'))->endOfDay()->utc()));
        $records = (clone $query)->with('items')->get();
        $items = $records->flatMap->items;

        return ['requests' => $records->count(), 'quotes' => $records->where('request_kind', 'quote')->count(), 'checkout' => $records->where('request_kind', 'checkout')->count(), 'legacy_cart' => $records->where('request_kind', 'legacy_cart')->count(), 'new' => $records->where('status', 'new')->count(), 'completed' => $records->where('status', 'completed')->count(), 'unclaimed' => $records->whereNull('assigned_to')->count(), 'claimed' => $records->whereNotNull('assigned_to')->count(), 'overdue' => $records->filter(fn ($r) => $r->follow_up_at?->isPast() && ! in_array($r->status, ['completed', 'closed', 'declined', 'cancelled', 'refunded', 'returned'], true))->count(), 'units' => $items->sum('quantity'), 'payment_methods' => $records->where('request_kind', 'checkout')->countBy('payment_method')->all(), 'payment_statuses' => $records->where('request_kind', 'checkout')->countBy('payment_status')->all(), 'statuses' => $records->countBy('status')->all(), 'owners' => $records->groupBy(fn ($r) => $r->assignee?->name ?? 'Unclaimed')->map->count()->all(),
            'trends' => $records->groupBy(function ($r) use ($period) {
                $date = $r->created_at->copy()->timezone(config('app.display_timezone'));

                return match ($period) {
                    'week' => $date->startOfWeek()->format('Y-m-d'),'month' => $date->format('Y-m'),'year' => $date->format('Y'),default => $date->format('Y-m-d')
                };
            })->map->count()->sortKeys()->all(),
            'top_products' => $items->groupBy('name')->map(fn ($rows) => $rows->sum('quantity'))->sortDesc()->take(10)->all(), 'recent' => (clone $query)->latest()->limit(10)->get()];
    }
}
