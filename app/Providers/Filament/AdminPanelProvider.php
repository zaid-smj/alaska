<?php

namespace App\Providers\Filament;

use App\Http\Controllers\Warranty\WarrantyFileController;
use App\Http\Middleware\TrackWorkSessionActivity;
use Filament\Auth\MultiFactor\App\AppAuthentication;
use Filament\Auth\MultiFactor\Http\Middleware\EnsureMultiFactorAuthenticationIsEnabled;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Filament\Widgets\AccountWidget;
use Illuminate\Contracts\View\View;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->brandName('Alaska Admin Portal')
            ->brandLogo(asset('assets/brand/alaska-logo.png'))
            ->darkModeBrandLogo(asset('assets/brand/alaska-logo-inv.png'))
            ->brandLogoHeight('2.5rem')
            ->authenticatedRoutes(function () {
                Route::get('/warranty-files/{upload}', WarrantyFileController::class)
                    ->middleware(EnsureMultiFactorAuthenticationIsEnabled::class)
                    ->name('warranty-files');
            })
            ->login()
            ->passwordReset()
            ->profile(isSimple: false)
            ->multiFactorAuthentication([
                AppAuthentication::make()
                    ->recoverable()
                    ->brandName('Alaska Admin Portal'),
            ], isRequired: true)
            ->colors([
                'primary' => array_replace(Color::hex('#c00d1e'), [
                    400 => '#c00d1e',
                    500 => '#c00d1e',
                    600 => '#c00d1e',
                    700 => '#a00a18',
                ]),
            ])
            ->discoverClusters(in: app_path('Filament/Clusters'), for: 'App\Filament\Clusters')
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn (): View => view('filament.brand-theme'),
            )
            ->renderHook(
                PanelsRenderHook::LAYOUT_END,
                fn (): View => view('filament.work-session-heartbeat'),
            )
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
                TrackWorkSessionActivity::class,
            ]);
    }
}
