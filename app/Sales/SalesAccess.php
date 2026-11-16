<?php

namespace App\Sales;

use App\Enums\AdminRole;
use App\Models\User;

class SalesAccess
{
    public static function allows(?User $user): bool
    {
        return $user?->is_active && (in_array($user->role, [AdminRole::SuperAdmin, AdminRole::Admin, AdminRole::Sales], true) || $user->can_manage_sales);
    }

    public static function authorize(): void
    {
        abort_unless(self::allows(auth()->user()), 403);
    }
}
