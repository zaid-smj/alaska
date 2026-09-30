<?php

namespace App\Filament\Resources\HomeBannerSlides\Pages;

use App\Filament\Resources\HomeBannerSlides\HomeBannerSlideResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditHomeBannerSlide extends EditRecord
{
    protected static string $resource = HomeBannerSlideResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
