<?php

namespace App\Filament\Catalog;

use App\Filament\Resources\CatalogResource;
use App\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

abstract class FamilyProductResource extends CatalogResource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationLabel = 'Products';

    protected static ?string $slug = 'products';

    protected static ?int $navigationSort = 1;

    public static string $family = 'lead-acid';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('type', static::$family);
    }

    public static function form(Schema $schema): Schema
    {
        return ProductForm::configure($schema, static::$family);
    }

    public static function table(Table $table): Table
    {
        $specifications = match (static::$family) {
            'lead-acid' => [TextColumn::make('plates'), TextColumn::make('voltage')->suffix(' V'), TextColumn::make('capacity_ah')->label('Capacity')->suffix(' Ah')],
            'inverter' => [TextColumn::make('inverterSpecifications.rated_capacity_kw')->label('Rated capacity')->suffix(' kW'), TextColumn::make('inverterSpecifications.phase')->label('Phase')],
            default => [TextColumn::make('lithiumSpecifications.nominal_voltage_v')->label('Voltage')->suffix(' V'), TextColumn::make('lithiumSpecifications.nominal_capacity_ah')->label('Capacity')->suffix(' Ah')],
        };

        return $table->defaultSort('sort_order')->columns([
            ImageColumn::make('image_url')->label('Image')->checkFileExistence(false),
            TextColumn::make('name')->searchable()->sortable(),
            TextColumn::make('series.name')->label('Series'),
            TextColumn::make('primaryCategory.name')->label('Category'),
            TextColumn::make('status')->badge(),
            ...$specifications,
            TextColumn::make('price_pkr')->label('Price')->money('PKR'),
            TextColumn::make('sort_order')->label('Order')->sortable(),
            TextColumn::make('legacy_notice')->label('Completion')->state(fn (Product $record) => $record->legacy_publication_exempt && $record->publicationIssues() !== [] ? 'Legacy: completion needed' : null)->badge()->color('warning'),
        ])->filters([
            SelectFilter::make('status')->options(['draft' => 'Draft', 'published' => 'Published', 'hidden' => 'Hidden']),
            SelectFilter::make('series')->relationship('series', 'name', fn (Builder $query) => $query->where('family', static::$family)),
            SelectFilter::make('category')->relationship('primaryCategory', 'name', fn (Builder $query) => $query->where('family', static::$family)),
        ])->recordActions([
            Action::make('view')->label('View existing page')->url(fn (Product $record) => route('products.show', $record->slug))->openUrlInNewTab()->visible(fn (Product $record) => $record->type === 'lead-acid' && $record->status === 'published' && $record->sections()->exists()),
            EditAction::make(),
            DeleteAction::make()->modalDescription('Permanently delete this product, gallery and uploaded documents.'),
        ]);
    }
}
