<?php

namespace App\Http\Controllers;

use App\Models\GalleryImage;
use App\Models\HomeBannerSlide;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WebsiteController extends Controller
{
    private const LEGACY_PAGES = [
        'about',
        'become-dealer',
        'CaAg',
        'dealers',
        'deep-cycle',
        'dry-charge',
        'FePO',
        'graphite',
        'inverters',
        'l-ion',
        'mcb',
        'mf',
        'solutions',
        'support',
        'technology',
        'tubular',
        'vrla',
    ];

    public function home(): Response
    {
        $slides = HomeBannerSlide::visible()->get()->map(fn (HomeBannerSlide $slide): array => [
            'desktop' => $slide->desktop_image_url,
            'mobile' => $slide->mobile_image_url ?: $slide->desktop_image_url,
            'alt' => $slide->alt_text,
            'kicker' => $slide->kicker,
            'title' => $slide->title,
            'subtitle' => $slide->subtitle,
            'primaryBtn' => $this->button($slide->primary_button_label, $slide->primary_button_url),
            'secondaryBtn' => $this->button($slide->secondary_button_label, $slide->secondary_button_url),
        ])->values()->all();

        return $this->htmlWithContent('index.html', ['homeBanners' => $slides]);
    }

    public function vault(): Response
    {
        $gallery = GalleryImage::visible()
            ->get()
            ->groupBy('category')
            ->map(fn ($images) => $images->map(fn (GalleryImage $image): array => [
                'src' => $image->image_url,
                'title' => $image->caption ?: $image->alt_text,
                'alt' => $image->alt_text,
            ])->values()->all())
            ->all();

        foreach (array_keys(GalleryImage::CATEGORIES) as $category) {
            $gallery[$category] ??= [];
        }

        return $this->htmlWithContent('vault.html', ['gallery' => $gallery]);
    }

    public function legacyPage(string $page): Response
    {
        abort_unless(in_array($page, self::LEGACY_PAGES, true), 404);

        return $this->htmlWithContent("{$page}.html", []);
    }

    public function uploadedAsset(string $path): BinaryFileResponse
    {
        return $this->safeFile(storage_path('app/public'), $path);
    }

    /** @return array{text: string, href: string}|null */
    private function button(?string $label, ?string $url): ?array
    {
        return filled($label) && filled($url) ? ['text' => $label, 'href' => $url] : null;
    }

    /** @param array<string, mixed> $content */
    private function htmlWithContent(string $filename, array $content): Response
    {
        $html = File::get(base_path($filename));
        $tailwind = '<link rel="stylesheet" href="'.Vite::asset('resources/css/site.css').'">';
        $html = str_replace(
            '<script src="https://cdn.tailwindcss.com"></script>',
            $tailwind,
            $html,
        );
        $html = str_replace(
            'href="css/style.css"',
            'href="/css/site-custom.css"',
            $html,
        );
        $json = json_encode(
            $content,
            JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES,
        );
        $script = "<script>window.ALASKA_CONTENT = {$json};</script>";

        return response(str_replace('</head>', "{$script}\n</head>", $html))
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function safeFile(string $root, string $path): BinaryFileResponse
    {
        $rootPath = realpath($root);
        $filePath = realpath($root.DIRECTORY_SEPARATOR.$path);

        abort_unless(
            $rootPath !== false
            && $filePath !== false
            && str_starts_with($filePath, $rootPath.DIRECTORY_SEPARATOR)
            && is_file($filePath),
            404,
        );

        return response()->file($filePath);
    }
}
