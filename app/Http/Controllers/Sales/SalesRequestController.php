<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Services\Sales\SalesWorkflow;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SalesRequestController extends Controller
{
    public function __invoke(Request $request, SalesWorkflow $service)
    {
        try {
            $result = $service->submit($request->all(), $request->session()->getId());
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['submission_key' => 'This request was already received. Retry the same submission.']);
        }

        return response()->json($result)->header('Cache-Control', 'no-store');
    }
}
