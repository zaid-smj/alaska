<?php

namespace App\Filament\Resources\CatalogBanners;

use App\Filament\Resources\CatalogResource;
use App\Models\CatalogBanner;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class CatalogBannerResource extends CatalogResource
{
    protected static ?string $model = CatalogBanner::class;

    protected static ?string $navigationLabel = 'Page banner';

    protected static ?int $navigationSort = 3;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('title')->required()->maxLength(255),
            Textarea::make('subtitle')->maxLength(1000),
            TextInput::make('alt_text')->label('Image description')->required()->maxLength(255),
            ...collect(['image' => 'Banner image', 'mobile_image' => 'Mobile image (optional)'])->map(fn ($label, $field) => FileUpload::make($field)->label($label)->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->disk('public')->directory('content/catalog')->visibility('public')->maxSize(10240)->helperText('Up to 10 MB. Mobile falls back to the main banner; an empty main image uses the default banner.'))->values()->all(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('title'), TextColumn::make('updated_at')->since()])->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListCatalogBanners::route('/'), 'edit' => Pages\EditCatalogBanner::route('/{record}/edit')];
    }
}
