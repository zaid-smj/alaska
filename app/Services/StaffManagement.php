<?php

namespace App\Services;

use App\Enums\AdminRole;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class StaffManagement
{
    public static function allows(?User $actor, User $target): bool
    {
        return $actor?->is_active && ($actor->role === AdminRole::SuperAdmin || ($actor->role === AdminRole::Admin && in_array($target->role, [AdminRole::Marketing, AdminRole::Sales], true)));
    }

    public static function invite(?User $actor, AdminRole $role): bool
    {
        return $actor?->is_active && isset(AdminRole::optionsFor($actor->role)[$role->value]);
    }

    public function update(User $actor, User $target, array $data): User
    {
        return DB::transaction(function () use ($actor, $target, $data) {
            $target = User::whereKey($target->id)->lockForUpdate()->firstOrFail();
            abort_unless(self::allows($actor, $target), 403);
            if (isset($data['role']) && $data['role'] !== $target->role->value) {
                abort_unless(self::invite($actor, AdminRole::from($data['role'])), 403);
            }
            if ($actor->role !== AdminRole::SuperAdmin) {
                foreach (['can_manage_warranties', 'can_manage_sales', 'can_manage_content'] as $flag) {
                    abort_if(array_key_exists($flag, $data) && (bool) $data[$flag] !== $target->$flag, 403);
                    unset($data[$flag]);
                }
            }
            $target->update(Arr::only($data, ['name', 'email', 'role', 'is_active', 'can_manage_warranties', 'can_manage_sales', 'can_manage_content']));

            return $target;
        });
    }
}
