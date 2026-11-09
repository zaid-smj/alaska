<?php

namespace App\Filament\Catalog;

use App\Filament\Resources\CatalogResource;
use App\Models\Catalog\ProductCategory;
use App\Services\AuditLogger;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

abstract class ClassificationResource extends CatalogResource
{
    public static string $family = 'lead-acid';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('family', static::$family);
    }

    public static function form(Schema $schema): Schema
    {
        $fields = [TextInput::make('name')->required()->maxLength(255), TextInput::make('sort_order')->integer()->minValue(0)->default(0)->required(), Toggle::make('is_active')->default(true)->helperText('Hide or reassign published products before deactivating.')];
        if (static::getModel() === ProductCategory::class) {
            $fields[] = Textarea::make('description')->maxLength(2000);
        }

        return $schema->components($fields);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort_order')->reorderable('sort_order')->afterReordering(function (array $order) {
            if (static::getModel() === ProductCategory::class && static::$family === 'lead-acid') {
                foreach (static::getEloquentQuery()->with('legacySection')->get() as $category) {
                    $category->legacySection?->update(['sort_order' => $category->sort_order]);
                }
            }
            app(AuditLogger::class)->record('content.catalog.classifications.reordered', 'Catalog classifications were reordered.', metadata: ['family' => static::$family, 'ids' => array_values($order)]);
        })->columns([
            TextColumn::make('name')->searchable(), IconColumn::make('is_active')->boolean(), TextColumn::make('products_count')->counts('products')->label('Products'), TextColumn::make('sort_order')->label('Order')->sortable(),
        ])->recordActions([EditAction::make(), DeleteAction::make()->modalDescription('Only unused classifications can be deleted. Deactivate classifications after hiding or reassigning their published products.')]);
    }
}
