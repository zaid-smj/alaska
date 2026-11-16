<?php

namespace App\Filament\Resources\SalesRequests;

use App\Filament\Sales\SalesResource;
use App\Models\Sales\SalesRequest;
use App\Sales\Money;
use Carbon\Carbon;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Navigation\NavigationItem;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class SalesRequestResource extends SalesResource
{
    protected static ?string $model = SalesRequest::class;

    protected static ?string $navigationLabel = 'Sales Requests';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table->modifyQueryUsing(fn ($query) => $query->with(['assignee', 'items']))->defaultSort('created_at', 'desc')->columns([
            TextColumn::make('number')->searchable()->copyable(), TextColumn::make('created_at')->label('Received (PKT)')->dateTime()->sortable(), TextColumn::make('name')->searchable(), TextColumn::make('email')->searchable()->toggleable(), TextColumn::make('phone')->searchable()->toggleable(), TextColumn::make('customer_type')->badge(), TextColumn::make('items.name')->label('Products'), TextColumn::make('units')->state(fn ($record) => $record->items->sum('quantity')), TextColumn::make('status')->badge(), TextColumn::make('request_kind')->label('Type')->badge(), TextColumn::make('payment_method')->label('Payment route')->badge()->placeholder('Quote only'), TextColumn::make('payment_status')->badge()->placeholder('Not applicable'), TextColumn::make('checkout_snapshot.pricing.final_total_cents')->label('Order total')->formatStateUsing(fn ($state) => Money::display($state))->placeholder('Quote pending'), TextColumn::make('claimed_at')->dateTime(), TextColumn::make('follow_up_at')->dateTime()->sortable(), TextColumn::make('assignee.name')->placeholder('Unassigned'),
        ])->filters([SelectFilter::make('payment_method')->options(['bank_transfer' => 'Bank transfer', 'cod' => 'Cash on Delivery']), SelectFilter::make('payment_status')->options(SalesRequest::PAYMENT_STATUSES), SelectFilter::make('request_kind')->label('Request type')->options(['quote' => 'Quote request', 'checkout' => 'Checkout order', 'legacy_cart' => 'Earlier cart enquiry']), SelectFilter::make('ownership')->options(['unclaimed' => 'Unclaimed', 'mine' => 'Claimed by me'])->query(fn ($query, $data) => $query->when(($data['value'] ?? null) === 'unclaimed', fn ($q) => $q->whereNull('assigned_to'))->when(($data['value'] ?? null) === 'mine', fn ($q) => $q->where('assigned_to', auth()->id()))), SelectFilter::make('status')->options(SalesRequest::STATUSES), SelectFilter::make('customer_type')->options(['individual' => 'Individual', 'business' => 'Business', 'dealer' => 'Dealer', 'installer' => 'Installer']), SelectFilter::make('assigned_to')->relationship('assignee', 'name'), Filter::make('received')->schema([DatePicker::make('from'), DatePicker::make('until')])->query(fn ($query, $data) => $query->when($data['from'] ?? null, fn ($q, $v) => $q->where('created_at', '>=', Carbon::parse($v, config('app.display_timezone'))->utc()))->when($data['until'] ?? null, fn ($q, $v) => $q->where('created_at', '<=', Carbon::parse($v, config('app.display_timezone'))->endOfDay()->utc())))])->recordActions([ViewAction::make()]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Customer and original request')->schema(array_map(fn ($field) => in_array($field, ['created_at', 'completed_at', 'claimed_at', 'follow_up_at'], true) ? TextEntry::make($field)->dateTime()->placeholder('Not provided') : TextEntry::make($field)->placeholder('Not provided'), ['number', 'created_at', 'name', 'email', 'phone', 'city', 'company', 'customer_type', 'address', 'source', 'message', 'applications', 'status', 'request_kind', 'assignee.name', 'claimed_at', 'follow_up_at', 'external_reference', 'tracking_reference', 'completed_at']))->columns(2),
            Section::make('Checkout totals — saved at purchase')->visible(fn ($record) => $record->request_kind === 'checkout')->schema([
                TextEntry::make('payment_method'), TextEntry::make('payment_status')->badge(), TextEntry::make('paymentRecorder.name')->label('Last external outcome recorded by'), TextEntry::make('payment_status_recorded_at')->dateTime(), TextEntry::make('payment_status_reference'),
                ...collect(['subtotal_excluding_tax_cents' => 'Products before tax', 'tax_cents' => 'Product tax', 'shipping_cents' => 'Shipping before tax', 'shipping_tax_cents' => 'Shipping tax', 'total_tax_cents' => 'All checkout taxes', 'final_total_cents' => 'Final payable total'])->map(fn ($label, $field) => TextEntry::make('checkout_snapshot.pricing.'.$field)->label($label)->formatStateUsing(fn ($state) => Money::display($state)))->values()->all(),
                RepeatableEntry::make('checkout_snapshot.pricing.lines')->schema([TextEntry::make('name'), TextEntry::make('quantity'), TextEntry::make('unit_price_cents')->formatStateUsing(fn ($state) => Money::display($state)), TextEntry::make('tax_cents')->formatStateUsing(fn ($state) => Money::display($state)), TextEntry::make('total_cents')->formatStateUsing(fn ($state) => Money::display($state)), RepeatableEntry::make('taxes')->schema([TextEntry::make('name'), TextEntry::make('rate_basis_points')->label('Rate (%)')->formatStateUsing(fn ($state) => $state / 100), TextEntry::make('taxable_base_cents')->formatStateUsing(fn ($state) => Money::display($state)), TextEntry::make('amount_cents')->formatStateUsing(fn ($state) => Money::display($state))])])->columns(3),
                RepeatableEntry::make('checkout_snapshot.pricing.shipping.taxes')->label('Shipping tax breakdown')->schema([TextEntry::make('name'), TextEntry::make('rate_basis_points')->label('Rate (%)')->formatStateUsing(fn ($state) => $state / 100), TextEntry::make('amount_cents')->formatStateUsing(fn ($state) => Money::display($state))]),
                RepeatableEntry::make('checkout_snapshot.payment_instructions.bank_accounts')->label('Bank instructions shown when placed')->schema([TextEntry::make('bank_name'), TextEntry::make('account_title'), TextEntry::make('account_number'), TextEntry::make('iban')])->columns(2), TextEntry::make('checkout_snapshot.payment_instructions.instructions'),
            ])->columns(2),
            Section::make('Purchase order / attachments')->schema([RepeatableEntry::make('attachments')->schema([TextEntry::make('original_name')->url(fn ($record) => route('filament.admin.sales-attachment', ['attachment' => $record]))->openUrlInNewTab(), TextEntry::make('created_at')->dateTime()])]),
            Section::make('Original requested products')->schema([RepeatableEntry::make('items')->schema([TextEntry::make('name'), TextEntry::make('category'), TextEntry::make('quantity'), TextEntry::make('unit_price_cents')->label('Original indicative unit price')->formatStateUsing(fn ($state) => Money::display($state))->placeholder('To be quoted'), TextEntry::make('note')])->columns(3)]),
            Section::make('Activity / internal notes')->schema([RepeatableEntry::make('activities')->schema([TextEntry::make('created_at')->dateTime(), TextEntry::make('actor.name')->placeholder('Customer / system'), TextEntry::make('event'), TextEntry::make('note'), TextEntry::make('changes')->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state) : $state)])->columns(2)]),
        ]);
    }

    public static function getNavigationItems(): array
    {
        if (! static::canViewAny()) {
            return [];
        }

        return collect(['new' => 'New Sales', 'pending' => 'Pending Sales', 'completed' => 'Completed Sales', 'all' => 'All Sales Requests'])->map(fn ($label, $tab) => NavigationItem::make($label)->group('Sales Management')->sort(2)->url(static::getUrl('index', ['activeTab' => $tab]))->isActiveWhen(fn () => request()->routeIs('filament.admin.resources.sales-requests.*') && request()->query('activeTab', 'all') === $tab))->values()->all();
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListSalesRequests::route('/'), 'view' => Pages\ViewSalesRequest::route('/{record}')];
    }
}
