<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\WorkSessionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackWorkSessionActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof User) {
            app(WorkSessionService::class)->closeStale();
            app(WorkSessionService::class)->markActive($user, $request->ip(), $request->userAgent());
        }

        return $next($request);
    }
}
