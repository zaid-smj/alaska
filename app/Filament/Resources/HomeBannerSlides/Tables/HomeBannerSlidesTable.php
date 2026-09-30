<?php

namespace App\Filament\Resources\HomeBannerSlides\Tables;

use App\Models\HomeBannerSlide;
use App\Services\AuditLogger;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class HomeBannerSlidesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->afterReordering(fn (array $order) => app(AuditLogger::class)->record(
                'content.banner.reordered',
                'Home page banner slides were reordered.',
                metadata: ['slide_ids' => array_values($order)],
            ))
            ->columns([
                ImageColumn::make('desktop_image_url')
                    ->label('Preview')
                    ->imageWidth(140)
                    ->imageHeight(70)
                    ->extraImgAttributes(['class' => 'object-cover rounded-lg'])
                    ->checkFileExistence(false),

                TextColumn::make('title')
                    ->description(fn (HomeBannerSlide $record): ?string => $record->kicker)
                    ->searchable(),

                TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),

                ToggleColumn::make('is_active')
                    ->label('Visible'),

                TextColumn::make('updated_at')
                    ->label('Last updated')
                    ->since()
                    ->dateTimeTooltip()
                    ->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()
                    ->modalHeading('Delete this banner slide?')
                    ->modalDescription('It will immediately disappear from the home page banner.'),
            ])
            ->toolbarActions([]);
    }
}
