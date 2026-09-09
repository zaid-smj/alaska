<?php

namespace App\Filament\Resources\LoginEvents;

use App\Enums\AdminRole;
use App\Filament\Resources\LoginEvents\Pages\ListLoginEvents;
use App\Filament\Resources\LoginEvents\Tables\LoginEventsTable;
use App\Models\LoginEvent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class LoginEventResource extends Resource
{
    protected static ?string $model = LoginEvent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static ?string $navigationLabel = 'Login History';

    protected static ?string $modelLabel = 'Login Event';

    protected static ?string $pluralModelLabel = 'Login History';

    public static function canViewAny(): bool
    {
        return Auth::user()?->role === AdminRole::SuperAdmin;
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return LoginEventsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLoginEvents::route('/'),
        ];
    }
}
