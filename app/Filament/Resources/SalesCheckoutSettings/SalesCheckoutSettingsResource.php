<?php

namespace App\Filament\Resources\SalesCheckoutSettings;

use App\Filament\Sales\SalesResource;
use App\Models\Sales\SalesCheckoutSettings;
use App\Models\Sales\SalesTaxProfile;
use App\Sales\Money;
use Filament\Actions\EditAction;
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

class SalesCheckoutSettingsResource extends SalesResource
{
    protected static ?string $model = SalesCheckoutSettings::class;

    protected static ?string $navigationLabel = 'Payment & Shipping Settings';

    protected static ?int $navigationSort = 6;

    public static function canViewAny(): bool
    {
        return SalesCheckoutSettings::canManage();
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return SalesCheckoutSettings::canManage();
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Toggle::make('checkout_enabled')->label('Enable checkout backend')->helperText('Enable only after payment instructions and applicable product/shipping tax rules are verified. This does not connect a bank gateway or WhatsApp bot.'), Toggle::make('bank_transfer_enabled')->label('Offer bank transfer'), Toggle::make('cod_enabled')->label('Offer Cash on Delivery'),
            TextInput::make('shipping_fee_cents')->label('Shipping charge before tax (PKR)')->numeric()->minValue(0)->required()->formatStateUsing(fn ($state) => $state === null ? null : number_format($state / 100, 2, '.', ''))->dehydrateStateUsing(fn ($state) => Money::cents($state))->helperText('Default PKR 500. Tax is calculated separately; changing this never changes saved orders.'), Select::make('shipping_tax_profile_id')->label('Confirmed shipping tax treatment')->options(fn () => SalesTaxProfile::where('family', 'shipping')->pluck('name', 'id'))->searchable()->helperText('Configure the applicable courier/delivery tax first, including an explicit confirmed zero rate if relevant.'),
            Repeater::make('bank_accounts')->label('Customer-facing bank accounts')->schema([TextInput::make('bank_name')->required()->maxLength(255), TextInput::make('account_title')->required()->maxLength(255), TextInput::make('account_number')->required()->maxLength(100), TextInput::make('iban')->label('IBAN (optional)')->maxLength(100)])->defaultItems(0)->maxItems(10)->columns(2), Textarea::make('bank_transfer_instructions')->label('Bank-transfer instructions shown at checkout')->maxLength(5000)->helperText('Public payment instructions only. Never enter login credentials, API keys or PINs.'), Textarea::make('cod_instructions')->label('COD instructions shown at checkout')->maxLength(5000),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('id')->label('Checkout settings'), IconColumn::make('checkout_enabled')->boolean(), TextColumn::make('shipping_fee_cents')->label('Shipping before tax')->formatStateUsing(fn ($state) => Money::display($state)), TextColumn::make('updated_at')->dateTime()])->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListSettings::route('/'), 'edit' => Pages\EditSettings::route('/{record}/edit')];
    }
}
