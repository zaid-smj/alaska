<?php

namespace App\Filament\Resources\GalleryImages\Tables;

use App\Models\GalleryImage;
use App\Services\AuditLogger;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class GalleryImagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->afterReordering(fn (array $order) => app(AuditLogger::class)->record(
                'content.gallery.reordered',
                'Gallery images were reordered.',
                metadata: ['image_ids' => array_values($order)],
            ))
            ->columns([
                ImageColumn::make('image_url')
                    ->label('Preview')
                    ->imageSize(72)
                    ->square()
                    ->extraImgAttributes(['class' => 'object-cover rounded-lg'])
                    ->checkFileExistence(false),

                TextColumn::make('alt_text')
                    ->label('Description')
                    ->description(fn (GalleryImage $record): ?string => $record->caption)
                    ->searchable(),

                TextColumn::make('category_label')
                    ->label('Category')
                    ->badge(),

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
            ->filters([
                SelectFilter::make('category')
                    ->options(GalleryImage::CATEGORIES),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()
                    ->modalHeading('Remove this gallery image?')
                    ->modalDescription('It will immediately disappear from the website gallery.'),
            ])
            ->toolbarActions([]);
    }
}
