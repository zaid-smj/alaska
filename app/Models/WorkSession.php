<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class WorkSession extends Model
{
    protected $fillable = [
        'user_id',
        'started_at',
        'last_seen_at',
        'ended_at',
        'end_reason',
        'start_ip_address',
        'last_ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function status(): Attribute
    {
        return Attribute::get(fn (): string => $this->ended_at ? 'Finished' : 'Working');
    }

    protected function durationSeconds(): Attribute
    {
        return Attribute::get(fn (): int => (int) $this->started_at->diffInSeconds($this->ended_at ?? now()));
    }

    protected function durationLabel(): Attribute
    {
        return Attribute::get(function (): string {
            $minutes = intdiv($this->duration_seconds, 60);
            $hours = intdiv($minutes, 60);
            $remainingMinutes = $minutes % 60;

            return $hours > 0
                ? "{$hours}h {$remainingMinutes}m"
                : "{$remainingMinutes}m";
        });
    }

    protected function endReasonLabel(): Attribute
    {
        return Attribute::get(fn (): string => match ($this->end_reason) {
            'logout' => 'Signed out',
            'forced_logout' => 'Signed out by Super Admin',
            'deactivated' => 'Account deactivated',
            'security_reset' => 'Security reset',
            'inactive' => 'Inactive for 15 minutes',
            default => $this->ended_at ? 'Ended' : 'Currently working',
        });
    }

    protected function activeDeviceCount(): Attribute
    {
        return Attribute::get(fn (): int => $this->ended_at
            ? 0
            : DB::table('sessions')
                ->where('user_id', $this->user_id)
                ->where('last_activity', '>=', now()->subMinutes(config('work-sessions.inactivity_timeout'))->timestamp)
                ->count());
    }

    protected function deviceLabel(): Attribute
    {
        return Attribute::get(function (): string {
            $agent = $this->user_agent ?? '';

            $platform = match (true) {
                str_contains($agent, 'Windows') => 'Windows',
                str_contains($agent, 'Macintosh') => 'macOS',
                str_contains($agent, 'iPhone'), str_contains($agent, 'iPad') => 'iOS',
                str_contains($agent, 'Android') => 'Android',
                str_contains($agent, 'Linux') => 'Linux',
                default => 'Unknown device',
            };

            $browser = match (true) {
                str_contains($agent, 'Edg/') => 'Edge',
                str_contains($agent, 'OPR/') => 'Opera',
                str_contains($agent, 'Chrome/') => 'Chrome',
                str_contains($agent, 'Firefox/') => 'Firefox',
                str_contains($agent, 'Safari/') => 'Safari',
                default => 'Unknown browser',
            };

            return "{$browser} on {$platform}";
        });
    }
}
