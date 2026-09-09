<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginEvent extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'event',
        'attempted_email',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function accountLabel(): Attribute
    {
        return Attribute::get(fn (): string => $this->user?->name
            ?? $this->attempted_email
            ?? 'Unknown account');
    }

    protected function accountEmail(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->user?->email ?? $this->attempted_email);
    }

    protected function deviceLabel(): Attribute
    {
        return Attribute::get(function (): string {
            $agent = $this->user_agent;

            if (! $agent) {
                return 'Unknown device';
            }

            $browser = match (true) {
                str_contains($agent, 'Edg/') => 'Edge',
                str_contains($agent, 'Chrome/') => 'Chrome',
                str_contains($agent, 'Firefox/') => 'Firefox',
                str_contains($agent, 'Safari/') => 'Safari',
                default => 'Other browser',
            };

            $device = match (true) {
                str_contains($agent, 'Windows') => 'Windows',
                str_contains($agent, 'Macintosh') => 'Mac',
                str_contains($agent, 'Android') => 'Android',
                preg_match('/iPhone|iPad/', $agent) === 1 => 'iPhone / iPad',
                default => 'Unknown device',
            };

            return "{$browser} on {$device}";
        });
    }
}
