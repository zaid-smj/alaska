<?php

namespace App\Filament\Resources\AdminInvitations;

use App\Enums\AdminRole;
use App\Filament\Resources\AdminInvitations\Pages\ListAdminInvitations;
use App\Filament\Resources\AdminInvitations\Tables\AdminInvitationsTable;
use App\Models\AdminInvitation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class AdminInvitationResource extends Resource
{
    protected static ?string $model = AdminInvitation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedEnvelope;

    protected static ?string $navigationLabel = 'Admin Invitations';

    protected static ?string $modelLabel = 'Admin Invitation';

    protected static ?string $pluralModelLabel = 'Admin Invitations';

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
        return AdminInvitationsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAdminInvitations::route('/'),
        ];
    }
}
