<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function record(
        string $event,
        string $description,
        ?Model $subject = null,
        array $metadata = [],
        ?User $actor = null,
    ): AuditLog {
        $request = app()->runningInConsole() ? null : request();
        $actor ??= Auth::user();

        return AuditLog::create([
            'actor_id' => $actor?->id,
            'event' => $event,
            'description' => $description,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'metadata' => $metadata ?: null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
