<?php

namespace App\Warranty;

use App\Enums\AdminRole;
use App\Models\User;

class WarrantyAccess
{
    public static function allows(?User $user): bool
    {
        return $user && $user->is_active && (in_array($user->role, [AdminRole::SuperAdmin, AdminRole::Admin], true) || $user->can_manage_warranties);
    }
}
