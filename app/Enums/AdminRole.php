<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum AdminRole: string implements HasLabel
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case ContentManager = 'content_manager';

    public function getLabel(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::ContentManager => 'Content Manager',
        };
    }

    public function canManageContent(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin, self::ContentManager], true);
    }

    public function canManageUsers(): bool
    {
        return $this === self::SuperAdmin;
    }

    public static function assignableOptions(): array
    {
        return [
            self::Admin->value => self::Admin->getLabel(),
            self::ContentManager->value => self::ContentManager->getLabel(),
        ];
    }
}
