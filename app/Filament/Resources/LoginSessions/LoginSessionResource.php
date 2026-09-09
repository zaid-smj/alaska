<?php

namespace App\Filament\Resources\LoginSessions;

use App\Enums\AdminRole;
use App\Filament\Resources\LoginSessions\Pages\ListLoginSessions;
use App\Filament\Resources\LoginSessions\Tables\LoginSessionsTable;
use App\Models\LoginSession;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class LoginSessionResource extends Resource
{
    protected static ?string $model = LoginSession::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedComputerDesktop;

    protected static ?string $navigationLabel = 'Login Sessions';

    protected static ?string $modelLabel = 'Login Session';

    protected static ?string $pluralModelLabel = 'Login Sessions';

    public static function canViewAny(): bool
    {
        return Auth::user()?->role === AdminRole::SuperAdmin;
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return LoginSessionsTable::configure($table);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', now()->subMinutes(config('session.lifetime'))->timestamp);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLoginSessions::route('/'),
        ];
    }
}
