<?php

namespace App\Console\Commands;

use App\Models\Sales\SalesAttachment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PruneSalesAttachments extends Command
{
    protected $signature = 'sales:prune-attachments';

    protected $description = 'Prune expired unattached purchase orders; retain submitted evidence.';

    public function handle(): int
    {
        SalesAttachment::whereNull('sales_request_id')->where('expires_at', '<', now())->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                DB::transaction(function () use ($row) {
                    $record = SalesAttachment::whereKey($row->id)->lockForUpdate()->first();
                    if (! $record || $record->sales_request_id || ! $record->expires_at->isPast()) {
                        return;
                    }Storage::disk('local')->delete($record->path);
                    $record->delete();
                });
            }
        });

        return self::SUCCESS;
    }
}
