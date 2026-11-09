<?php

namespace App\Filament\Resources\WarrantyRegistrations;

use App\Filament\Warranty\WarrantyRecord;
use App\Filament\Warranty\WarrantyResource;
use App\Models\Warranty\WarrantyRegistration;
use Filament\Actions\ViewAction;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class WarrantyRegistrationResource extends WarrantyResource
{
    protected static ?string $model = WarrantyRegistration::class;

    protected static ?string $navigationLabel = 'Registered Warranties';

    protected static ?int $navigationSort = 1;

    public static function infolist(Schema $schema): Schema
    {
        return WarrantyRecord::infolist($schema, false);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('registered_at', 'desc')->columns([TextColumn::make('reference')->searchable()->copyable(), TextColumn::make('name')->searchable(), TextColumn::make('email')->searchable(), TextColumn::make('phone')->searchable(), TextColumn::make('product_model')->searchable(), TextColumn::make('serial_number')->searchable(), TextColumn::make('registered_at')->dateTime()->sortable(), TextColumn::make('claims_count')->counts('claims')])->recordActions([ViewAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListRegistrations::route('/'), 'view' => Pages\ViewRegistration::route('/{record}')];
    }
}
