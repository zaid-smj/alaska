<?php

namespace App\Filament\Resources\HomeBannerSlides\Schemas;

use App\Models\HomeBannerSlide;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class HomeBannerSlideForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Banner content')
                    ->schema([
                        TextInput::make('kicker')
                            ->label('Small heading')
                            ->maxLength(255),

                        TextInput::make('title')
                            ->required()
                            ->maxLength(255),

                        Textarea::make('subtitle')
                            ->rows(3)
                            ->columnSpanFull(),

                        TextInput::make('alt_text')
                            ->label('Image description')
                            ->helperText('Briefly describe the image for accessibility and search engines.')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Images')
                    ->schema([
                        FileUpload::make('desktop_image')
                            ->label('Desktop banner image')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->disk('public')
                            ->directory('content/home-banners/desktop')
                            ->visibility('public')
                            ->maxSize(10240)
                            ->required(fn (?HomeBannerSlide $record): bool => blank($record?->desktop_image) && blank($record?->legacy_desktop_path))
                            ->helperText('Recommended: wide WebP image. Leave unchanged to keep the current image.'),

                        FileUpload::make('mobile_image')
                            ->label('Mobile banner image')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->disk('public')
                            ->directory('content/home-banners/mobile')
                            ->visibility('public')
                            ->maxSize(10240)
                            ->helperText('Optional. The desktop image is used when no mobile image is supplied.'),
                    ])
                    ->columns(2),

                Section::make('Buttons')
                    ->schema([
                        TextInput::make('primary_button_label')
                            ->label('Primary button text')
                            ->maxLength(100),

                        TextInput::make('primary_button_url')
                            ->label('Primary button link')
                            ->maxLength(2048)
                            ->placeholder('products.html or https://example.com'),

                        TextInput::make('secondary_button_label')
                            ->label('Secondary button text')
                            ->maxLength(100),

                        TextInput::make('secondary_button_url')
                            ->label('Secondary button link')
                            ->maxLength(2048)
                            ->placeholder('support.html or https://example.com'),
                    ])
                    ->columns(2),

                Section::make('Display')
                    ->schema([
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
