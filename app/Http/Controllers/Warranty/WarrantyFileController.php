<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\Warranty\WarrantyClaim;
use App\Models\Warranty\WarrantyRegistration;
use App\Models\Warranty\WarrantyUpload;
use App\Services\AuditLogger;
use App\Warranty\WarrantyAccess;
use Illuminate\Support\Facades\Storage;

class WarrantyFileController extends Controller
{
    public function __invoke(WarrantyUpload $upload)
    {
        abort_unless(WarrantyAccess::allows(auth()->user()), 403);
        abort_unless(($upload->warranty_registration_id || $upload->warranty_claim_id) && Storage::disk('local')->exists($upload->path), 404);
        $subject = $upload->warranty_claim_id
            ? WarrantyClaim::findOrFail($upload->warranty_claim_id)
            : WarrantyRegistration::findOrFail($upload->warranty_registration_id);
        app(AuditLogger::class)->record('warranty.attachment.downloaded', 'Staff downloaded a warranty attachment.', $subject, ['upload_id' => $upload->id]);

        return response()->download(Storage::disk('local')->path($upload->path), pathinfo($upload->original_name, PATHINFO_FILENAME).'.'.pathinfo($upload->path, PATHINFO_EXTENSION), ['Content-Type' => $upload->mime, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }
}
