<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\WorkSessionService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WorkSessionHeartbeatController extends Controller
{
    public function __invoke(Request $request, WorkSessionService $workSessions): Response
    {
        /** @var User $user */
        $user = $request->user();

        $workSessions->closeStale();
        $workSessions->markActive($user, $request->ip(), $request->userAgent());

        return response()->noContent();
    }
}
