<?php

namespace App\Filament\Resources\ProductSections;

use App\Filament\Resources\CatalogResource;
use App\Models\ProductSection;
use App\Services\AuditLogger;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductSectionResource extends CatalogResource
{
    protected static ?string $model = ProductSection::class;

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Sections & order';

    protected static ?string $pluralModelLabel = 'Lead Acid sections';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->unique(ignoreRecord: true)->maxLength(255),
            TextInput::make('sort_order')->label('Display order')->integer()->minValue(0)->default(0)->required(),
            Textarea::make('description')->maxLength(2000)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort_order')->reorderable('sort_order')
            ->afterReordering(fn (array $order) => app(AuditLogger::class)->record('content.catalog.sections.reordered', 'Product sections were reordered.', metadata: ['section_ids' => array_values($order)]))
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('products_count')->counts('products')->label('Products'),
                TextColumn::make('sort_order')->label('Order')->sortable(),
            ])->recordActions([
                EditAction::make(),
                DeleteAction::make()->modalHeading('Remove this section?')->modalDescription('All products in this section will become drafts, including products shared with another section. Products and their images will be preserved for editing, reassignment or deletion.'),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListProductSections::route('/'), 'create' => Pages\CreateProductSection::route('/create'), 'edit' => Pages\EditProductSection::route('/{record}/edit')];
    }
}
