<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Enums\AdminRole;
use App\Models\User;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),

                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required()
                    ->disabled(
                        fn (?User $record): bool => $record?->role === AdminRole::SuperAdmin
                    ),

                Toggle::make('is_active')
                    ->label('Active')
                    ->disabled(
                        fn (?User $record): bool => $record?->role === AdminRole::SuperAdmin
                    ),
            ]);
    }
}
