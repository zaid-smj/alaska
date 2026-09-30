<?php

namespace App\Filament\Resources\GalleryImages\Schemas;

use App\Models\GalleryImage;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class GalleryImageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Gallery image')
                    ->schema([
                        FileUpload::make('image')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->disk('public')
                            ->directory('content/gallery')
                            ->visibility('public')
                            ->maxSize(10240)
                            ->required(fn (?GalleryImage $record): bool => blank($record?->image) && blank($record?->legacy_image_path))
                            ->helperText('Up to 10 MB. Leave unchanged to keep the current image.')
                            ->columnSpanFull(),

                        Select::make('category')
                            ->options(GalleryImage::CATEGORIES)
                            ->required()
                            ->native(false),

                        TextInput::make('alt_text')
                            ->label('Image description')
                            ->helperText('Briefly describe the image for accessibility and search engines.')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('caption')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        TextInput::make('sort_order')
                            ->label('Display order')
                            ->numeric()
                            ->minValue(0)
                            ->default(0)
                            ->required(),

                        Toggle::make('is_active')
                            ->label('Show on website')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }
}
