<?php

namespace App\Filament\Resources\WorkSessions;

use App\Enums\AdminRole;
use App\Filament\Resources\WorkSessions\Pages\ListWorkSessions;
use App\Filament\Resources\WorkSessions\Tables\WorkSessionsTable;
use App\Models\WorkSession;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class WorkSessionResource extends Resource
{
    protected static string|\UnitEnum|null $navigationGroup = 'Admin Section';

    protected static ?string $model = WorkSession::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBriefcase;

    protected static ?string $navigationLabel = 'Employee Sessions';

    protected static ?string $modelLabel = 'Employee Session';

    protected static ?string $pluralModelLabel = 'Employee Sessions';

    public static function canViewAny(): bool
    {
        return (bool) (Auth::user()?->is_active && in_array(Auth::user()?->role, [AdminRole::SuperAdmin, AdminRole::Admin], true));
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();

        return Auth::user()?->role === AdminRole::Admin ? $query->whereHas('user', fn ($q) => $q->whereIn('role', ['marketing', 'sales'])->orWhere('id', Auth::id())) : $query;
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
        return WorkSessionsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListWorkSessions::route('/'),
        ];
    }
}
