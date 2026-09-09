<?php

use App\Http\Controllers\AdminInvitationController;
use App\Http\Controllers\WorkSessionHeartbeatController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin/invitations/accept/{token}', [AdminInvitationController::class, 'show'])
    ->middleware('throttle:30,1')
    ->name('admin.invitations.accept');

Route::post('/admin/invitations/accept/{token}', [AdminInvitationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('admin.invitations.store');

Route::post('/admin/work-session/heartbeat', WorkSessionHeartbeatController::class)
    ->middleware(['auth', 'throttle:60,1'])
    ->name('admin.work-session.heartbeat');
