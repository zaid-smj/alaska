<?php

namespace App\Providers;

use App\Models\LoginEvent;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(fn (): Password => Password::min(12)
            ->letters()
            ->mixedCase()
            ->numbers()
            ->symbols());

        Event::listen(Login::class, function (Login $event): void {
            if ($event->user instanceof User) {
                LoginEvent::create([
                    'user_id' => $event->user->id,
                    'event' => 'login',
                    'attempted_email' => $event->user->email,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            }
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user instanceof User) {
                LoginEvent::create([
                    'user_id' => $event->user->id,
                    'event' => 'logout',
                    'attempted_email' => $event->user->email,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            }
        });

        Event::listen(Failed::class, function (Failed $event): void {
            $email = strtolower(trim((string) ($event->credentials['email'] ?? 'unknown account')));

            LoginEvent::create([
                'user_id' => $event->user instanceof User ? $event->user->id : null,
                'event' => 'failed',
                'attempted_email' => $email,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });
    }
}
