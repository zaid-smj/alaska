<?php

namespace App\Services\Catalog;

use App\Models\Article;
use App\Models\Catalog\ProductDocument;
use App\Models\Catalog\ProductGalleryImage;
use App\Models\CatalogBanner;
use App\Models\NavbarImage;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MediaFiles
{
    public static function validate(?string $path, bool $pdf = false): void
    {
        if (blank($path)) {
            return;
        }
        $disk = Storage::disk('public');
        $validPath = str_starts_with($path, 'content/') && ! str_contains($path, '..') && ! str_contains($path, '\\');
        $extensions = $pdf ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'];
        $validPath = $validPath && in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), $extensions, true);
        $types = $pdf ? ['application/pdf'] : ['image/jpeg', 'image/png', 'image/webp'];
        $valid = $validPath && $disk->exists($path) && $disk->size($path) <= 10 * 1024 * 1024;
        if ($valid) {
            // Inspect bytes rather than trusting a filename-derived MIME fallback.
            $valid = in_array((new \finfo(FILEINFO_MIME_TYPE))->buffer($disk->get($path)), $types, true);
        }
        if (! $valid) {
            throw ValidationException::withMessages(['path' => $pdf ? 'Upload a valid PDF up to 10 MB.' : 'Upload a JPEG, PNG or WebP image up to 10 MB.']);
        }
    }

    public static function removeAfterCommit(?string $path): void
    {
        if (! $path || ! str_starts_with($path, 'content/')) {
            return;
        }
        DB::afterCommit(function () use ($path) {
            // Do not remove a file if another saved record still references it.
            if (Article::where('image', $path)->orWhere('mobile_image', $path)->exists()
                || NavbarImage::where('image', $path)->exists()
                || Product::where('image', $path)->exists()
                || CatalogBanner::where('image', $path)->orWhere('mobile_image', $path)->exists()
                || ProductGalleryImage::where('path', $path)->exists()
                || ProductDocument::where('path', $path)->exists()) {
                return;
            }
            Storage::disk('public')->delete($path);
        });
    }
}
