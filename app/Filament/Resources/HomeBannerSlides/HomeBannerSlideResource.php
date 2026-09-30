<?php

namespace App\Filament\Resources\HomeBannerSlides;

use App\Enums\AdminRole;
use App\Filament\Resources\HomeBannerSlides\Pages\CreateHomeBannerSlide;
use App\Filament\Resources\HomeBannerSlides\Pages\EditHomeBannerSlide;
use App\Filament\Resources\HomeBannerSlides\Pages\ListHomeBannerSlides;
use App\Filament\Resources\HomeBannerSlides\Schemas\HomeBannerSlideForm;
use App\Filament\Resources\HomeBannerSlides\Tables\HomeBannerSlidesTable;
use App\Models\HomeBannerSlide;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class HomeBannerSlideResource extends Resource
{
    protected static ?string $model = HomeBannerSlide::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $navigationLabel = 'Home Page Banner';

    protected static ?string $modelLabel = 'Banner Slide';

    protected static ?string $pluralModelLabel = 'Home Page Banner';

    protected static string|UnitEnum|null $navigationGroup = 'Content Management';

    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return self::canManageContent();
    }

    public static function canCreate(): bool
    {
        return self::canManageContent();
    }

    public static function canEdit(Model $record): bool
    {
        return self::canManageContent();
    }

    public static function canDelete(Model $record): bool
    {
        return self::canManageContent();
    }

    public static function canReorder(): bool
    {
        return self::canManageContent();
    }

    public static function form(Schema $schema): Schema
    {
        return HomeBannerSlideForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return HomeBannerSlidesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListHomeBannerSlides::route('/'),
            'create' => CreateHomeBannerSlide::route('/create'),
            'edit' => EditHomeBannerSlide::route('/{record}/edit'),
        ];
    }

    private static function canManageContent(): bool
    {
        return in_array(Auth::user()?->role, [AdminRole::SuperAdmin, AdminRole::Admin], true);
    }
}
