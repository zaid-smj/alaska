<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\AdminRole;
use App\Services\AuditLogger;
use App\Services\WorkSessionService;
use Database\Factories\UserFactory;
use Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthentication;
use Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthenticationRecovery;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthentication;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthenticationRecovery;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

#[Fillable(['name', 'email', 'email_verified_at', 'password', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, HasAppAuthentication, HasAppAuthenticationRecovery
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, InteractsWithAppAuthentication, InteractsWithAppAuthenticationRecovery, Notifiable;

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

        static::updated(function (User $user) {
            if ($user->wasChanged('is_active') && ! $user->is_active) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
                app(WorkSessionService::class)->end($user, 'deactivated');
            }

            $changes = collect(['name', 'email', 'role', 'is_active'])
                ->filter(fn (string $field): bool => $user->wasChanged($field))
                ->mapWithKeys(fn (string $field): array => [$field => [
                    'from' => $user->getRawOriginal($field),
                    'to' => $user->getAttributes()[$field] ?? null,
                ]])
                ->all();

            if ($changes !== []) {
                app(AuditLogger::class)->record(
                    'admin.updated',
                    "Administrator {$user->email} was updated.",
                    $user,
                    ['changes' => $changes],
                );
            }
        });

        static::created(function (User $user) {
            app(AuditLogger::class)->record(
                'admin.created',
                "Administrator {$user->email} was created.",
                $user,
                ['role' => $user->role->value],
            );
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
