<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\Warranty\WarrantyUpload;
use App\Services\Warranty\DocumentAutofill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WarrantyUploadController extends Controller
{
    public function store(Request $request, DocumentAutofill $reader)
    {
        $request->validate(['file' => ['required', 'file', 'max:'.config('warranty.upload_max_kb')]]);
        $file = $request->file('file');
        $mime = $file->getMimeType();
        $allowed = ['application/pdf' => 'pdf', 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'text/plain' => 'txt', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx'];
        if ($mime === 'application/zip' && strtolower($file->getClientOriginalExtension()) === 'docx') {
            $mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        if (! isset($allowed[$mime])) {
            throw ValidationException::withMessages(['file' => 'Upload a PDF, DOCX, text document, JPEG, PNG or WebP image.']);
        }
        if ($allowed[$mime] === 'docx') {
            $zip = new \ZipArchive;
            $opened = $zip->open($file->getRealPath()) === true;
            $entry = $opened ? $zip->statName('word/document.xml') : false;
            $valid = $entry && $entry['size'] <= 2 * 1024 * 1024 && $zip->numFiles <= 2000;
            if ($opened) {
                $zip->close();
            }
            if (! $valid) {
                throw ValidationException::withMessages(['file' => 'Upload a valid DOCX document within the extraction limits.']);
            }
        }
        if (str_starts_with($mime, 'image/')) {
            $size = @getimagesize($file->getRealPath());
            if (! $size || $size[0] * $size[1] > 20_000_000) {
                throw ValidationException::withMessages(['file' => 'Use a readable image up to 20 megapixels.']);
            }
        }
        $id = (string) Str::uuid();
        $path = $file->storeAs('warranty/uploads', $id.'.'.$allowed[$mime], 'local');
        try {
            $result = $reader->extract($path, $mime);
            $upload = WarrantyUpload::create(['id' => $id, 'session_hash' => hash('sha256', $request->session()->getId()), 'path' => $path, 'original_name' => mb_substr(preg_replace('/[\x00-\x1F\x7F]/', '', basename($file->getClientOriginalName())), 0, 255), 'mime' => $mime, 'size' => $file->getSize(), 'extracted_fields' => $result['fields'], 'extraction_status' => $result['status'], 'extraction_message' => $result['message'], 'expires_at' => now()->addHours(config('warranty.upload_lifetime_hours'))]);
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }

        return response()->json(['upload_id' => $upload->id, ...$result])->header('Cache-Control', 'no-store');
    }
}
