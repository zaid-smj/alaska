<?php

use App\Http\Controllers\AdminInvitationController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\Warranty\WarrantySubmissionController;
use App\Http\Controllers\Warranty\WarrantyUploadController;
use App\Http\Controllers\WebsiteController;
use App\Http\Controllers\WorkSessionHeartbeatController;
use Illuminate\Support\Facades\Route;

Route::get('/lead-acid', [ProductCatalogController::class, 'index'])->name('catalog.lead-acid');
Route::get('/products/compare-search', [ProductCatalogController::class, 'compareSearch'])->name('products.compare-search');
Route::get('/products/{slug}', [ProductCatalogController::class, 'show'])->name('products.show');
Route::get('/solutions/{type}', [WebsiteController::class, 'productRange'])->where('type', 'lithium-ion|inverters')->name('catalog.range');

Route::redirect('/preview-lithium.html', '/solutions/lithium-ion');
Route::redirect('/preview-inverters.html', '/solutions/inverters');

Route::get('/', [WebsiteController::class, 'home'])->name('site.home');
Route::get('/index.html', [WebsiteController::class, 'home'])->name('site.index');
Route::get('/vault.html', [WebsiteController::class, 'vault'])->name('site.vault');

Route::get('/{page}.html', [WebsiteController::class, 'legacyPage'])
    ->where('page', '[A-Za-z0-9-]+')
    ->name('site.legacy-page');

Route::get('/media/{path}', [WebsiteController::class, 'uploadedAsset'])
    ->where('path', '.*')
    ->name('site.uploaded-asset');

Route::get('/admin/invitations/accept/{token}', [AdminInvitationController::class, 'show'])
    ->middleware('throttle:30,1')
    ->name('admin.invitations.accept');

Route::post('/admin/invitations/accept/{token}', [AdminInvitationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('admin.invitations.store');

Route::post('/admin/work-session/heartbeat', WorkSessionHeartbeatController::class)
    ->middleware(['auth', 'throttle:60,1'])
    ->name('admin.work-session.heartbeat');

Route::post('/warranty/uploads', [WarrantyUploadController::class, 'store'])->middleware('throttle:5,1')->name('warranty.uploads');
Route::post('/warranty/registrations', [WarrantySubmissionController::class, 'registration'])->middleware('throttle:10,1')->name('warranty.registrations');
Route::post('/warranty/claims', [WarrantySubmissionController::class, 'claim'])->middleware('throttle:10,1')->name('warranty.claims');
