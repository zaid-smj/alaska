<?php

namespace App\Filament\Resources\NavbarImages;

use App\Filament\Resources\CatalogResource;
use App\Models\NavbarImage;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\ImageEntry;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

class NavbarImageResource extends CatalogResource
{
    protected static ?string $model = NavbarImage::class;

    protected static ?string $cluster = null;

    protected static string|UnitEnum|null $navigationGroup = 'Content Management';

    protected static ?string $navigationLabel = 'Navbar Images';

    protected static ?string $modelLabel = 'Navbar Image';

    protected static ?int $navigationSort = 3;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('position')->formatStateUsing(fn ($record) => $record?->name)->disabled()->dehydrated(false),
            ImageEntry::make('image_url')->label('Current image')->imageHeight(160),
            FileUpload::make('image')->label('Replacement image')->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->disk('public')->directory('content/navbar')->visibility('public')->maxSize(10240)->helperText('JPEG, PNG or WebP, up to 10 MB. Remove the replacement to restore the original. Transparent PNG or WebP works best for logos.'),
            TextInput::make('alt_text')->label('Image description (optional)')->maxLength(255),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([ImageColumn::make('image_url')->label('Preview'), TextColumn::make('name')->label('Position'), TextColumn::make('updated_at')->since()])->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListNavbarImages::route('/'), 'edit' => Pages\EditNavbarImage::route('/{record}/edit')];
    }
}
