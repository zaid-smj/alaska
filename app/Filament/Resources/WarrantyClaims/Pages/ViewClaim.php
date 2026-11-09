<?php

namespace App\Filament\Resources\WarrantyClaims\Pages;

use App\Filament\Resources\WarrantyClaims\WarrantyClaimResource;
use App\Models\User;
use App\Models\Warranty\WarrantyClaim;
use App\Services\Warranty\WarrantyWorkflow;
use App\Warranty\WarrantyAccess;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Pages\ViewRecord;

class ViewClaim extends ViewRecord
{
    protected static string $resource = WarrantyClaimResource::class;

    protected function getHeaderActions(): array
    {
        return [Action::make('review')->label('Update review / add note')->fillForm(fn () => ['status' => $this->record->status, 'assigned_to' => $this->record->assigned_to])->schema([
            Select::make('status')->options(WarrantyClaim::STATUSES)->required(),
            Select::make('assigned_to')->label('Assigned to')->options(fn () => User::get()->filter(fn ($user) => WarrantyAccess::allows($user))->pluck('name', 'id'))->searchable(),
            Textarea::make('note')->label('Internal note')->maxLength(5000),
        ])->action(function (array $data) {
            app(WarrantyWorkflow::class)->review($this->record, auth()->user(), $data);
            $this->record->refresh();
        })];
    }
}
