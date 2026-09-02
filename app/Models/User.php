<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\AdminRole;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Validation\ValidationException;

#[Fillable(['name', 'email', 'password', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => AdminRole::class,
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (
                $user->role === AdminRole::SuperAdmin
                && User::where('role', AdminRole::SuperAdmin->value)->exists()
            ) {
                throw ValidationException::withMessages([
                    'role' => 'Only one Super Admin account may exist.',
                ]);
            }
        });

        static::updating(function (User $user) {
            $originalRole = $user->getRawOriginal('role');

            if (
                $originalRole !== AdminRole::SuperAdmin->value
                && $user->role === AdminRole::SuperAdmin
            ) {
                throw ValidationException::withMessages([
                    'role' => 'Another account cannot be promoted to Super Admin.',
                ]);
            }

            if ($originalRole === AdminRole::SuperAdmin->value) {
                if ($user->role !== AdminRole::SuperAdmin) {
                    throw ValidationException::withMessages([
                        'role' => 'The Super Admin account cannot be demoted.',
                    ]);
                }

                if (! $user->is_active) {
                    throw ValidationException::withMessages([
                        'is_active' => 'The Super Admin account cannot be deactivated.',
                    ]);
                }
            }
        });
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin'
            && $this->is_active
            && in_array($this->role, [
                AdminRole::SuperAdmin,
                AdminRole::Admin,
            ], true);
    }
}
