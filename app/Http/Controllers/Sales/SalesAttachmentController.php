<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\SalesAttachment;
use App\Models\Sales\SalesRequest;
use App\Sales\SalesAccess;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SalesAttachmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['file' => ['required', 'file', 'max:5120']]);
        $file = $request->file('file');
        $mime = $file->getMimeType();
        $extensions = ['application/pdf' => 'pdf', 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (! isset($extensions[$mime])) {
            throw ValidationException::withMessages(['file' => 'Use a PDF, JPEG, PNG or WebP purchase order up to 5 MB.']);
        }if (str_starts_with($mime, 'image/')) {
            $image = @getimagesize($file->getRealPath());
            if (! $image || $image[0] * $image[1] > 20000000) {
                throw ValidationException::withMessages(['file' => 'Use an image up to 20 megapixels.']);
            }
        }
        $id = (string) Str::uuid();
        $path = $file->storeAs('sales/attachments', $id.'.'.$extensions[$mime], 'local');
        try {
            $record = SalesAttachment::create(['id' => $id, 'session_hash' => hash('sha256', $request->session()->getId()), 'path' => $path, 'original_name' => mb_substr(preg_replace('/[\x00-\x1F\x7F]/', '', basename($file->getClientOriginalName())), 0, 255), 'mime' => $mime, 'size' => $file->getSize(), 'expires_at' => now()->addDay()]);
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }

        return response()->json(['upload_id' => $record->id])->header('Cache-Control', 'no-store');
    }

    public function download(SalesAttachment $attachment)
    {
        SalesAccess::authorize();
        abort_unless($attachment->sales_request_id && Storage::disk('local')->exists($attachment->path), 404);
        app(AuditLogger::class)->record('sales.attachment.downloaded', 'Purchase-order attachment downloaded.', SalesRequest::findOrFail($attachment->sales_request_id), ['attachment_id' => $attachment->id]);

        return response()->download(Storage::disk('local')->path($attachment->path), pathinfo($attachment->original_name, PATHINFO_FILENAME).'.'.pathinfo($attachment->path, PATHINFO_EXTENSION), ['Content-Type' => $attachment->mime, 'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
