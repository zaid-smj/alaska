<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\SalesCheckoutSettings;
use App\Services\Sales\CheckoutWorkflow;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function options()
    {
        $settings = SalesCheckoutSettings::firstOrFail();

        return response()->json(['checkout_enabled' => $settings->checkout_enabled, 'currency' => 'PKR', 'cart_unit_limit' => config('sales.cart_unit_limit', 49), 'payment_methods' => ['bank_transfer' => $settings->bank_transfer_enabled, 'cod' => $settings->cod_enabled], 'shipping_before_tax_cents' => $settings->shipping_fee_cents, 'final_total_requires_preview' => true])->header('Cache-Control', 'no-store');
    }

    public function preview(Request $request, CheckoutWorkflow $workflow)
    {
        return response()->json($workflow->preview($request->all(), $request->session()->getId()))->header('Cache-Control', 'no-store');
    }

    public function confirm(Request $request, CheckoutWorkflow $workflow)
    {
        try {
            $result = $workflow->confirm($request->all(), $request->session()->getId());
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['submission_key' => 'This checkout request was already received. Retry the same submission.']);
        }

        return response()->json($result)->header('Cache-Control', 'no-store');
    }
}
