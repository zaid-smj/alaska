<?php

namespace App\Filament\Resources\SalesRequests\Pages;

use App\Filament\Resources\SalesRequests\SalesRequestResource;
use App\Models\Sales\SalesRequest;
use App\Models\User;
use App\Sales\SalesAccess;
use App\Services\AuditLogger;
use App\Services\Sales\SalesWorkflow;
use Filament\Actions\Action;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Pages\ViewRecord;

class ViewSalesRequest extends ViewRecord
{
    protected static string $resource = SalesRequestResource::class;

    public function mount(int|string $record): void
    {
        parent::mount($record);
        app(AuditLogger::class)->record('sales.request.viewed', 'Sales request details opened.', $this->record);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('claim')->label('Claim this request')->visible(fn () => $this->record->assigned_to === null)->requiresConfirmation()->action(function () {
                app(SalesWorkflow::class)->claim($this->record, auth()->user());
                $this->record->refresh();
            }),
            Action::make('transfer')->label('Transfer / assign')->fillForm(fn () => ['expected_assigned_to' => $this->record->assigned_to, 'assigned_to' => $this->record->assigned_to])->schema([Hidden::make('expected_assigned_to'), Select::make('assigned_to')->label('New owner')->options(fn () => User::all()->filter(fn ($u) => SalesAccess::allows($u))->pluck('name', 'id'))->required()->searchable(), Textarea::make('note')->label('Handover reason / instructions')->required()->maxLength(5000)])->action(function ($data) {
                app(SalesWorkflow::class)->transfer($this->record, auth()->user(), $data);
                $this->record->refresh();
            }),
            Action::make('addNote')->label('Add handover / work note')->schema([Textarea::make('note')->required()->maxLength(5000)])->action(function ($data) {
                app(SalesWorkflow::class)->addNote($this->record, auth()->user(), $data['note']);
                $this->record->refresh();
            }),
            Action::make('paymentOutcome')->label('Record external payment status')->visible(fn () => $this->record->request_kind === 'checkout')->fillForm(fn () => ['payment_status' => $this->record->payment_status])->schema([Select::make('payment_status')->options(fn () => $this->record->payment_method === 'bank_transfer' ? array_intersect_key(SalesRequest::PAYMENT_STATUSES, array_flip(['awaiting_verification', 'bank_transfer_verified', 'verification_failed'])) : array_intersect_key(SalesRequest::PAYMENT_STATUSES, array_flip(['awaiting_collection', 'cod_collected', 'collection_failed'])))->required(), TextInput::make('reference')->label('Finance / collection confirmation reference')->required()->maxLength(255), Textarea::make('note')->label('What was verified externally, and by whom?')->required()->maxLength(5000)])->modalDescription('This records an employee statement about work verified outside the website. It does not check a bank account or collect money.')->requiresConfirmation()->action(function ($data) {
                app(SalesWorkflow::class)->paymentOutcome($this->record, auth()->user(), $data);
                $this->record->refresh();
            }),
            Action::make('review')->label('Update status / follow-up')->fillForm(fn () => ['status' => $this->record->status, 'tracking_reference' => $this->record->tracking_reference, 'external_reference' => $this->record->external_reference, 'follow_up_at' => $this->record->follow_up_at])->schema([Select::make('status')->options(SalesRequest::STATUSES)->required(), DateTimePicker::make('follow_up_at')->label('Next follow-up (PKT)'), TextInput::make('external_reference')->label('External proposal / invoice / team reference')->maxLength(255), TextInput::make('tracking_reference')->label('Delivery / return reference (if applicable)')->maxLength(255), Textarea::make('note')->label('Status reason / external outcome / internal note')->maxLength(5000)->helperText('Required when changing status. Payments and documents are handled outside this portal.')])->action(function ($data) {
                app(SalesWorkflow::class)->review($this->record, auth()->user(), $data);
                $this->record->refresh();
            }),
        ];
    }
}
