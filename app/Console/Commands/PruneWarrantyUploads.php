<?php

namespace App\Console\Commands;

use App\Models\Warranty\WarrantyUpload;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PruneWarrantyUploads extends Command
{
    protected $signature = 'warranty:prune-uploads';

    protected $description = 'Delete expired unattached warranty upload files; never remove submitted evidence.';

    public function handle(): int
    {
        $count = 0;
        WarrantyUpload::whereNull('warranty_registration_id')->whereNull('warranty_claim_id')->where('expires_at', '<', now())->chunkById(100, function ($rows) use (&$count) {
            foreach ($rows as $upload) {
                DB::transaction(function () use ($upload, &$count) {
                    $record = WarrantyUpload::whereKey($upload->id)->lockForUpdate()->first();
                    if (! $record || $record->warranty_registration_id || $record->warranty_claim_id || ! $record->expires_at->isPast()) {
                        return;
                    } Storage::disk('local')->delete($record->path);
                    $record->delete();
                    $count++;
                });
            }
        });
        $this->info("Pruned {$count} expired uploads.");

        return self::SUCCESS;
    }
}
