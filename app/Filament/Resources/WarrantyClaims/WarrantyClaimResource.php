<?php

namespace App\Filament\Resources\WarrantyClaims;

use App\Filament\Warranty\WarrantyRecord;
use App\Filament\Warranty\WarrantyResource;
use App\Models\Warranty\WarrantyClaim;
use Filament\Actions\ViewAction;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class WarrantyClaimResource extends WarrantyResource
{
    protected static ?string $model = WarrantyClaim::class;

    protected static ?string $navigationLabel = 'Warranty Claims / Tasks';

    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        return static::canViewAny() ? (string) WarrantyClaim::whereIn('status', ['new', 'in_review', 'awaiting_information'])->count() : null;
    }

    public static function infolist(Schema $schema): Schema
    {
        return WarrantyRecord::infolist($schema, true);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('claimed_at', 'desc')->columns([TextColumn::make('reference')->searchable(), TextColumn::make('name')->searchable(), TextColumn::make('product_model')->searchable(), TextColumn::make('registration.reference')->label('Registration')->placeholder('Transition exception'), TextColumn::make('registration_state')->badge(), TextColumn::make('status')->badge(), TextColumn::make('assignee.name')->label('Assigned to')->placeholder('Unassigned'), TextColumn::make('claimed_at')->dateTime()->sortable()])->filters([SelectFilter::make('status')->options(WarrantyClaim::STATUSES), SelectFilter::make('assigned_to')->relationship('assignee', 'name')])->recordActions([ViewAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListClaims::route('/'), 'view' => Pages\ViewClaim::route('/{record}')];
    }
}
