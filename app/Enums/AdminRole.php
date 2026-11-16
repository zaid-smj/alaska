<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum AdminRole: string implements HasLabel
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Marketing = 'marketing';
    case Sales = 'sales';

    public const ContentManager = self::Marketing;

    public function getLabel(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',self::Admin => 'Admin',self::Marketing => 'Marketing',self::Sales => 'Sales'
        };
    }

    public function canManageContent(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin, self::Marketing], true);
    }

    public function canManageUsers(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin], true);
    }

    public static function assignableOptions(): array
    {
        return self::optionsFor(auth()->user()?->role ?? self::SuperAdmin);
    }

    public static function optionsFor(self $actor): array
    {
        return match ($actor) {
            self::SuperAdmin => ['admin' => 'Admin', 'marketing' => 'Marketing', 'sales' => 'Sales'],self::Admin => ['marketing' => 'Marketing', 'sales' => 'Sales'],default => []
        };
    }
}
