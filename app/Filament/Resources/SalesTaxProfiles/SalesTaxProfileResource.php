<?php

namespace App\Filament\Resources\SalesTaxProfiles;

use App\Enums\AdminRole;
use App\Filament\Sales\SalesResource;
use App\Models\Product;
use App\Models\Sales\SalesTaxProfile;
use App\Sales\Money;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class SalesTaxProfileResource extends SalesResource
{
    protected static ?string $model = SalesTaxProfile::class;

    protected static ?string $navigationLabel = 'Checkout Tax Configuration';

    protected static ?int $navigationSort = 5;

    public static function canCreate(): bool
    {
        return auth()->user()?->is_active && in_array(auth()->user()?->role, [AdminRole::SuperAdmin, AdminRole::Admin], true);
    }

    public static function canEdit(Model $record): bool
    {
        return static::canCreate();
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(255), Select::make('family')->options(['lead-acid' => 'Lead Acid', 'inverter' => 'Inverters', 'lithium-ion' => 'Lithium', 'shipping' => 'Shipping / delivery'])->required()->live(), Select::make('product_ids')->multiple()->label('Specific products (empty = family default)')->options(fn ($get) => Product::where('type', $get('family'))->pluck('name', 'id'))->searchable(), Select::make('calculation_basis')->options(['transaction_value' => 'Selling value', 'retail_price' => 'Confirmed printed retail price (Third Schedule)'])->required(), TextInput::make('rate_basis_points')->label('Sales tax rate (%)')->numeric()->minValue(0)->maxValue(100)->formatStateUsing(fn ($state) => $state === null ? null : $state / 100)->dehydrateStateUsing(fn ($state) => Money::cents($state))->required(),
            Repeater::make('additional_taxes')->label('Other confirmed taxes on the same basis (optional)')->schema([TextInput::make('name')->required()->maxLength(100), TextInput::make('rate_basis_points')->label('Rate (%)')->numeric()->minValue(0)->maxValue(100)->formatStateUsing(fn ($state) => $state === null ? null : $state / 100)->dehydrateStateUsing(fn ($state) => Money::cents($state))->required()])->defaultItems(0)->maxItems(10),
            Toggle::make('price_includes_tax')->label('Catalog selling price already includes these taxes')->required(), DatePicker::make('effective_from')->required(), DatePicker::make('effective_until'), TextInput::make('source_url')->label('Official tax rule / notification URL')->url()->required()->maxLength(2048), Textarea::make('applicability_notes')->label('Accounts-confirmed applicability, exemptions and price basis')->required()->maxLength(2000)->helperText('Do not activate a guessed rate. Confirm registration, transaction type, applicable exemptions and any further taxes with accounts.'), Toggle::make('is_active')->label('Accounts confirmed — use this rule')->default(false)->helperText('Confirm the applicable company/product/courier treatment before activation. No rates are guessed or prefilled.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name'), TextColumn::make('family'), TextColumn::make('calculation_basis'), TextColumn::make('rate_basis_points')->label('Rate (%)')->formatStateUsing(fn ($state) => $state / 100), IconColumn::make('is_active')->boolean(), TextColumn::make('approved_at')->dateTime()])->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListProfiles::route('/'), 'create' => Pages\CreateProfile::route('/create'), 'edit' => Pages\EditProfile::route('/{record}/edit')];
    }
}
