<?php

namespace App\Filament\Pages;

use App\Models\Article;
use App\Models\GalleryImage;
use App\Models\HomeBannerSlide;
use App\Models\Product;
use Filament\Pages\Page;
use UnitEnum;

class MarketingOverview extends Page
{
    protected static string|UnitEnum|null $navigationGroup = 'Marketing';

    protected static ?string $navigationLabel = 'Overview';

    protected string $view = 'filament.pages.marketing-overview';

    public static function canAccess(): bool
    {
        return auth()->user()?->canManageContent() ?? false;
    }

    protected function getViewData(): array
    {
        abort_unless(static::canAccess(), 403);

        return ['products' => Product::count(), 'articles' => Article::count(), 'publishedArticles' => Article::published()->count(), 'banners' => HomeBannerSlide::count(), 'gallery' => GalleryImage::count()];
    }
}
