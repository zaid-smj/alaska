<?php

namespace App\Filament\Resources\Products;

use App\Filament\Resources\CatalogResource;
use App\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProductResource extends CatalogResource
{
    protected static ?string $model = Product::class;

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Batteries';

    protected static ?string $modelLabel = 'Lead Acid product';

    protected static ?string $pluralModelLabel = 'Lead Acid products';

    protected static ?string $slug = 'products';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('type', 'lead-acid');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Product')->schema([
                TextInput::make('name')->required()->maxLength(255)->helperText('Create separate products for L and R models.'),
                TextInput::make('slug')->maxLength(255)->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->unique(ignoreRecord: true)->helperText('Generated from the name when blank. Keep this stable after sharing the page.'),
                Select::make('status')->options(['draft' => 'Draft', 'published' => 'Published'])->default('draft')->required()->live(),
                Select::make('sections')->relationship('sections', 'name')->multiple()->preload()->searchable()->required(fn (Get $get): bool => $get('status') === 'published')->helperText('Published products need at least one section.'),
                TextInput::make('price_pkr')->label('Price (PKR)')->numeric()->minValue(0)->maxValue(9999999999.99)->prefix('PKR'),
                TextInput::make('sort_order')->label('Display order')->integer()->minValue(0)->default(0)->required(),
                Textarea::make('description')->maxLength(10000)->columnSpanFull(),
            ])->columns(2),
            Section::make('Product image')->schema([
                FileUpload::make('image')->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->disk('public')->directory('content/products')->visibility('public')->maxSize(10240)->required(fn (?Product $record): bool => blank($record?->image) && blank($record?->legacy_image_path))->helperText('Up to 10 MB. Use a clear product photo on a consistent background.'),
                TextInput::make('alt_text')->label('Image description')->required()->maxLength(255),
            ])->columns(2),
            Section::make('Specifications')->schema([
                TextInput::make('plates')->integer()->minValue(1)->maxValue(65535),
                TextInput::make('voltage')->label('Voltage (V)')->numeric()->minValue(0.01)->maxValue(999999.99),
                TextInput::make('capacity_ah')->label('Capacity / Ampere (Ah)')->numeric()->minValue(0.01)->maxValue(99999999.99),
                TextInput::make('warranty')->maxLength(255)->helperText('For example: 12 months or No warranty.'),
                TextInput::make('weight_kg')->label('Weight (kg)')->numeric()->minValue(0.001)->maxValue(9999999.999),
                TextInput::make('box_size')->maxLength(255),
                TextInput::make('length')->requiredWith('width,height')->numeric()->minValue(0.01)->maxValue(99999999.99),
                TextInput::make('width')->requiredWith('length,height')->numeric()->minValue(0.01)->maxValue(99999999.99),
                TextInput::make('height')->requiredWith('length,width')->numeric()->minValue(0.01)->maxValue(99999999.99),
                Select::make('dimension_unit')->options(['mm' => 'Millimetres (mm)', 'cm' => 'Centimetres (cm)', 'in' => 'Inches (in)'])->default('mm')->required(),
                CheckboxList::make('tags')->options(Product::TAGS)->columnSpanFull(),
                Textarea::make('uses')->label('Recommended uses')->maxLength(2000)->columnSpanFull(),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort_order')->columns([
            ImageColumn::make('image_url')->label('Image')->checkFileExistence(false),
            TextColumn::make('name')->searchable()->sortable(),
            TextColumn::make('sections.name')->badge(),
            TextColumn::make('status')->badge(),
            TextColumn::make('capacity_ah')->label('Ah'),
            TextColumn::make('price_pkr')->label('Price')->money('PKR'),
            TextColumn::make('sort_order')->label('Order')->sortable(),
        ])->filters([
            SelectFilter::make('status')->options(['draft' => 'Draft', 'published' => 'Published']),
            SelectFilter::make('sections')->relationship('sections', 'name')->multiple(),
        ])->recordActions([
            Action::make('view')->label('View page')->url(fn (Product $record): string => route('products.show', $record->slug))->openUrlInNewTab()->visible(fn (Product $record): bool => $record->status === 'published' && $record->sections()->exists()),
            EditAction::make(),
            DeleteAction::make()->modalDescription('This permanently deletes the product and its uploaded image.'),
        ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListProducts::route('/'), 'create' => Pages\CreateProduct::route('/create'), 'edit' => Pages\EditProduct::route('/{record}/edit')];
    }
}
