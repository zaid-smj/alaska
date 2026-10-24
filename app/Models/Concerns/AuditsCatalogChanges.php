<?php

namespace App\Models\Concerns;

use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Model;

trait AuditsCatalogChanges
{
    public static function bootAuditsCatalogChanges(): void
    {
        foreach (['created', 'updated', 'deleted'] as $event) {
            static::{$event}(function (Model $record) use ($event): void {
                app(AuditLogger::class)->record(
                    'content.catalog.'.class_basename($record).'.'.$event,
                    class_basename($record)." '{$record->getAttribute('name')}' was {$event}.",
                    $record,
                    ['fields' => array_keys($record->getChanges())],
                );
            });
        }
    }
}
