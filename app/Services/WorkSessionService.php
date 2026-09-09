<?php

namespace App\Services;

use App\Models\User;
use App\Models\WorkSession;
use Illuminate\Support\Facades\DB;

class WorkSessionService
{
    public function markActive(User $user, ?string $ipAddress = null, ?string $userAgent = null): WorkSession
    {
        return DB::transaction(function () use ($user, $ipAddress, $userAgent): WorkSession {
            $now = now();
            $timeoutMinutes = config('work-sessions.inactivity_timeout');
            $session = WorkSession::where('user_id', $user->id)
                ->whereNull('ended_at')
                ->lockForUpdate()
                ->first();

            if ($session && $session->last_seen_at->lt($now->copy()->subMinutes($timeoutMinutes))) {
                $session->update([
                    'ended_at' => $session->last_seen_at->copy()->addMinutes($timeoutMinutes),
                    'end_reason' => 'inactive',
                ]);
                $session = null;
            }

            if (! $session) {
                return WorkSession::create([
                    'user_id' => $user->id,
                    'started_at' => $now,
                    'last_seen_at' => $now,
                    'start_ip_address' => $ipAddress,
                    'last_ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);
            }

            $session->update([
                'last_seen_at' => $now,
                'last_ip_address' => $ipAddress ?? $session->last_ip_address,
                'user_agent' => $userAgent ?? $session->user_agent,
            ]);

            return $session;
        });
    }

    public function end(User $user, string $reason = 'logout'): ?WorkSession
    {
        return DB::transaction(function () use ($user, $reason): ?WorkSession {
            $session = WorkSession::where('user_id', $user->id)
                ->whereNull('ended_at')
                ->lockForUpdate()
                ->first();

            if (! $session) {
                return null;
            }

            $session->update([
                'last_seen_at' => now(),
                'ended_at' => now(),
                'end_reason' => $reason,
            ]);

            return $session;
        });
    }

    public function endIfNoOtherActiveDevices(User $user, string $reason, ?string $excludedSessionId = null): ?WorkSession
    {
        $activeSessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('last_activity', '>=', now()->subMinutes(config('work-sessions.inactivity_timeout'))->timestamp);

        if ($excludedSessionId) {
            $activeSessions->where('id', '!=', $excludedSessionId);
        }

        return $activeSessions->exists() ? null : $this->end($user, $reason);
    }

    public function closeStale(): int
    {
        $closed = 0;
        $timeoutMinutes = config('work-sessions.inactivity_timeout');
        $cutoff = now()->subMinutes($timeoutMinutes);

        WorkSession::whereNull('ended_at')
            ->where('last_seen_at', '<', $cutoff)
            ->each(function (WorkSession $session) use (&$closed, $timeoutMinutes): void {
                $session->update([
                    'ended_at' => $session->last_seen_at->copy()->addMinutes($timeoutMinutes),
                    'end_reason' => 'inactive',
                ]);
                $closed++;
            });

        return $closed;
    }
}
