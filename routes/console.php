<?php

use App\Services\WorkSessionService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(fn () => app(WorkSessionService::class)->closeStale())
    ->name('close-stale-work-sessions')
    ->everyMinute()
    ->withoutOverlapping();
