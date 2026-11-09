<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Services\Warranty\WarrantyWorkflow;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WarrantySubmissionController extends Controller
{
    public function registration(Request $request, WarrantyWorkflow $workflow)
    {
        return $this->submit($request, $workflow, 'registration');
    }

    public function claim(Request $request, WarrantyWorkflow $workflow)
    {
        return $this->submit($request, $workflow, 'claim');
    }

    private function submit(Request $request, WarrantyWorkflow $workflow, string $kind)
    {
        try {
            $result = $workflow->submit($kind, $request->all(), $request->session()->getId());
        } catch (UniqueConstraintViolationException) {
            // Concurrent duplicate requests never reveal another customer's reference.
            throw ValidationException::withMessages(['submission_key' => 'This submission was already received. Retry with the same details, or contact support.']);
        }

        return response()->json($result)->header('Cache-Control', 'no-store');
    }
}
