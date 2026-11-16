<?php

namespace App\Console\Commands;

use App\Models\Sales\SalesCheckoutPreview;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneCheckoutPreviews extends Command
{
    protected $signature = 'sales:prune-checkout-previews';

    protected $description = 'Remove expired unused checkout previews; retain every placed order and its snapshot.';

    public function handle(): int
    {
        SalesCheckoutPreview::where('expires_at', '<', now())->whereDoesntHave('order')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                DB::transaction(function () use ($row) {
                    $preview = SalesCheckoutPreview::whereKey($row->id)->lockForUpdate()->first();
                    if (! $preview || ! $preview->expires_at->isPast() || $preview->order()->exists()) {
                        return;
                    }$preview->delete();
                });
            }
        });

        return self::SUCCESS;
    }
}
