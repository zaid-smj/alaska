<?php

namespace App\Filament\Warranty;

use App\Filament\Resources\WarrantyRegistrations\WarrantyRegistrationResource;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class WarrantyRecord
{
    public static function fields(string $prefix = ''): array
    {
        return array_map(fn ($name) => TextEntry::make($prefix.$name)->label(str($name)->replace('_', ' ')->title()->toString())->placeholder('Not provided'), ['name', 'phone', 'email', 'city', 'product_type', 'product_model', 'serial_number', 'card_number', 'purchase_date', 'dealer']);
    }

    public static function infolist(Schema $schema, bool $claim): Schema
    {
        $components = [Section::make('Submitted customer and product information')->schema(self::fields())->columns(2), Section::make('Submission times')->schema([
            TextEntry::make('reference'), TextEntry::make($claim ? 'claimed_at' : 'registered_at')->dateTime(), TextEntry::make('confirmed_at')->dateTime(), TextEntry::make('consented_at')->dateTime(), TextEntry::make('form_version'),
        ])->columns(2)];
        if ($claim) {
            $components[] = Section::make('Claim review')->schema([TextEntry::make('status')->badge(), TextEntry::make('assignee.name')->label('Assigned to')->placeholder('Unassigned'), TextEntry::make('registration_state')->label('Registration check'), TextEntry::make('registration_reference')->placeholder('Not supplied'), TextEntry::make('problem_started_on')->date(), TextEntry::make('issue'), TextEntry::make('usage'), TextEntry::make('description')])->columns(2);
            $components[] = Section::make('Original linked registration')->schema([TextEntry::make('registration.reference')->url(fn ($record) => $record->registration ? WarrantyRegistrationResource::getUrl('view', ['record' => $record->registration->id]) : null), TextEntry::make('registration.registered_at')->dateTime(), ...self::fields('registration.')])->columns(2)->description('A missing registration is a transition exception requiring manual verification. Linked details are shown separately from the claim snapshot.');
        }
        $components[] = Section::make('Attachments')->schema([self::uploads('uploads')]);
        if ($claim) {
            $components[] = Section::make('Original registration attachments')->schema([self::uploads('registration.uploads')]);
            $components[] = Section::make('Review history')->schema([RepeatableEntry::make('activities')->schema([TextEntry::make('created_at')->dateTime(), TextEntry::make('actor.name')->placeholder('Customer / system'), TextEntry::make('event'), TextEntry::make('note'), TextEntry::make('changes')->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state, JSON_UNESCAPED_UNICODE) : $state)])->columns(2)]);
        }
        $components[] = Section::make('Original form snapshot')->schema([RepeatableEntry::make('snapshot_entries')->state(fn ($record) => collect($record->form_snapshot)->except(['submission_key', 'upload_id'])->map(fn ($value, $key) => ['field' => $key, 'value' => is_bool($value) ? ($value ? 'Yes' : 'No') : (is_array($value) ? json_encode($value) : $value)])->values()->all())->schema([TextEntry::make('field'), TextEntry::make('value')])->columns(2)])->collapsed();

        return $schema->components($components);
    }

    public static function uploads(string $relationship): RepeatableEntry
    {
        return RepeatableEntry::make($relationship)->schema([TextEntry::make('original_name')->label('Download file')->url(fn ($record) => route('filament.admin.warranty-files', ['upload' => $record->id]))->openUrlInNewTab(), TextEntry::make('mime'), TextEntry::make('created_at')->dateTime(), TextEntry::make('extraction_status')])->columns(2);
    }
}
