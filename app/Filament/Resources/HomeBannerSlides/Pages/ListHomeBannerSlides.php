<?php

namespace App\Filament\Resources\HomeBannerSlides\Pages;

use App\Filament\Resources\HomeBannerSlides\HomeBannerSlideResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListHomeBannerSlides extends ListRecords
{
    protected static string $resource = HomeBannerSlideResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->label('Add Banner Slide'),
        ];
    }
}
