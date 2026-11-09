<?php

namespace App\Filament\Catalog;

use App\Filament\Resources\CatalogResource;
use App\Models\Vehicles\VehicleFitment;
use App\Models\Vehicles\VehicleMake;
use App\Models\Vehicles\VehicleModel;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

abstract class VehicleResource extends CatalogResource
{
    protected static string|UnitEnum|null $navigationGroup = 'Vehicle Compatibility';

    public static function form(Schema $schema): Schema
    {
        $fields = match (static::getModel()) {
            VehicleMake::class => [TextInput::make('name')->required()->maxLength(255), Toggle::make('is_active')->default(true)],
            VehicleModel::class => [Select::make('vehicle_make_id')->label('Make')->relationship('make', 'name')->searchable()->preload()->required(), TextInput::make('name')->required()->maxLength(255), Toggle::make('is_active')->default(true)],
            default => [
                Select::make('vehicle_model_id')->label('Make / Model')->relationship('model', 'name')->getOptionLabelFromRecordUsing(fn (VehicleModel $record) => $record->make->name.' / '.$record->name)->searchable()->preload()->required(),
                TextInput::make('year_from')->integer()->minValue(1886)->maxValue(2200)->required(), TextInput::make('year_to')->integer()->minValue(1886)->maxValue(2200)->gte('year_from')->required()->helperText('For a single model year, enter the same start and end year.'),
                Select::make('products')->relationship('products', 'name', fn (Builder $query) => $query->where('type', 'lead-acid'))->multiple()->searchable()->preload()->helperText('Assign only verified compatibility. No sample matching data is inferred.'), Textarea::make('notes')->maxLength(5000),
            ],
        };

        return $schema->components($fields);
    }

    public static function table(Table $table): Table
    {
        $columns = static::getModel() === VehicleFitment::class ? [TextColumn::make('model.make.name')->label('Make'), TextColumn::make('model.name')->searchable(), TextColumn::make('year_from'), TextColumn::make('year_to'), TextColumn::make('products.name')->badge()] : [TextColumn::make('name')->searchable(), TextColumn::make('is_active')->badge()];

        return $table->columns($columns)->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
