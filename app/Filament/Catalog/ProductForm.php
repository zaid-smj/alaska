<?php

namespace App\Filament\Catalog;

use App\Catalog\ProductFamily;
use App\Catalog\SpecificationFields;
use App\Models\Catalog\ProductCategory;
use App\Models\Catalog\ProductSeries;
use App\Models\Catalog\ProductTag;
use App\Models\Product;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Text;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema, string $family): Schema
    {
        $familyEnum = ProductFamily::from($family);
        $options = fn ($model) => $model::where('family', $family)->orderBy('sort_order')->orderBy('name')->get()->mapWithKeys(fn ($item) => [$item->id => $item->name.($item->is_active ? '' : ' (inactive)')])->all();
        $sections = [
            Section::make('Legacy publication notice')->schema([
                Text::make(fn (?Product $record) => 'This existing published product is grandfathered. Complete the missing fields gradually. Moving it to Draft or Hidden removes the exception; full validation will then be required. Missing: '.implode(', ', array_keys($record?->publicationIssues() ?? []))),
            ])->visible(fn (?Product $record) => $record?->legacy_publication_exempt && $record->publicationIssues() !== []),
            Section::make('Basic Product Information')->schema([
                TextInput::make('name')->label('Product Name')->maxLength(255),
                TextInput::make('slug')->maxLength(255)->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->unique(ignoreRecord: true)->helperText('Generated when blank. Keep existing slugs to preserve shared URLs.'),
                TextInput::make('technology')->default($familyEnum->technology())->maxLength(255),
                Textarea::make('description')->maxLength(10000),
            ])->columns(2),
            Section::make('Series / Category / Tags')->schema([
                Select::make('series_id')->label('Series')->options(fn () => $options(ProductSeries::class))->searchable(),
                Select::make('primary_category_id')->label('Primary Category')->options(fn () => $options(ProductCategory::class))->searchable()->helperText('Exactly one primary category. Historical Lead Acid memberships are preserved.'),
                Select::make('tag_ids')->label('Tags')->multiple()->options(fn () => $options(ProductTag::class))->searchable(),
            ])->columns(3),
            Section::make('Main Image and Gallery')->schema([
                self::image('image')->label('Main Image')->helperText('Required before publishing; existing bundled images are preserved.'),
                TextInput::make('alt_text')->label('Main image description')->maxLength(255),
                Repeater::make('gallery')->schema([Hidden::make('id'), self::image('path')->required(), TextInput::make('alt_text')->label('Image description')->maxLength(255)])->defaultItems(0)->reorderable()->collapsible()->columnSpanFull(),
            ])->columns(2),
        ];
        foreach (['main' => 'Main Specifications', 'secondary' => 'Secondary Specifications'] as $classification => $title) {
            $components = [];
            foreach (SpecificationFields::shared($family) as $name => $definition) {
                if ($definition['classification'] === $classification) {
                    $components[] = self::measurement($name, $definition);
                }
            }
            foreach (SpecificationFields::for($family) as $name => $definition) {
                if ($definition['classification'] === $classification) {
                    if ($name === 'nominal_energy_wh') {
                        $components[] = TextInput::make('specs.energy_value')->label('Nominal Energy')->numeric()->helperText('Required for publication. Stored in Wh; choose the input unit beside it.');
                    } else {
                        $component = self::measurement('specs.'.$name, $definition);
                        if ($name === 'energy_unit') {
                            $component->default('Wh');
                        }
                        $components[] = $component;
                    }
                }
            }
            $sections[] = Section::make($title)->schema($components)->columns(3);
        }
        $sections[] = Section::make('Specification Visibility')->description('Visibility affects future display only. Required values are still required for publishing.')->schema(array_map(fn ($key) => Toggle::make('specification_visibility.'.$key)->label(str($key)->replace('_', ' ')->title()->toString())->default(true), SpecificationFields::toggles($family)))->columns(3)->collapsed();
        foreach (['features' => 'Product Features', 'recommended_uses' => 'Recommended Uses', 'warranty_details' => 'Warranty Information', 'installation_instructions' => 'Installation Instructions'] as $field => $label) {
            $sections[] = Section::make($label)->schema([
                Repeater::make($field)->label($label)->schema([Textarea::make('text')->label('Entry')->maxLength(5000)])->defaultItems(0)->default(fn () => $field === 'features' ? array_map(fn ($text) => ['text' => $text], SpecificationFields::featureSuggestions($family)) : [])->reorderable()->collapsible()->helperText('Add, edit, delete and reorder entries. At least one entry is required before publishing. Suggested features must be verified for this model.'.($family === 'lithium-ion' && $field === 'recommended_uses' ? ' Suggestions: Solar Energy Storage; UPS and Backup Power; Signals and EPS; Base Stations; Electric Vehicles; Residential Energy Storage; Commercial and Industrial Energy Storage; Telecom Sites; IT / Data Centers; Other Power Applications.' : '')),
            ]);
        }
        $sections[] = Section::make('Certifications / Safety Standards')->schema([Textarea::make('certifications')->maxLength(10000), Toggle::make('certifications_visible')->label('Show certifications')->default(true)]);
        $documents = [];
        foreach ($familyEnum->documentSlots() as $slot => $label) {
            $documents[] = Section::make($label)->schema([
                FileUpload::make('documents.'.$slot.'.path')->label('PDF (optional)')->acceptedFileTypes(['application/pdf'])->disk('public')->directory('content/products/documents')->visibility('public')->maxSize(10240),
                Toggle::make('documents.'.$slot.'.is_visible')->label('Show document when a PDF is present')->default(true),
            ])->columns(2);
        }
        $sections[] = Section::make('Additional Documents')->schema($documents)->collapsed();
        if ($family === 'lead-acid') {
            $sections[] = Section::make('Preserved legacy information')->description('Original dimensions/units, free-text warranty and weight are retained. Do not reinterpret Length as Depth or assume this weight is dry weight.')->schema([
                TextInput::make('warranty')->label('Legacy warranty text'),
                TextInput::make('weight_kg')->label('Legacy weight (kg)')->numeric()->minValue(0),
                TextInput::make('length')->label('Legacy length')->numeric(), TextInput::make('width')->label('Legacy width')->numeric(), TextInput::make('height')->label('Legacy height')->numeric(),
                Select::make('dimension_unit')->label('Legacy dimension unit')->options(['mm' => 'mm', 'cm' => 'cm', 'in' => 'in'])->default('mm'),
            ])->columns(3)->collapsed();
        }
        $sections[] = Section::make('Publication Settings')->schema([
            Select::make('status')->options(['draft' => 'Draft', 'published' => 'Published', 'hidden' => 'Hidden'])->default('draft')->required()->helperText('Incomplete drafts can be saved. All required specifications and content are checked on the server before publication.'),
            TextInput::make('price_pkr')->label('Price (PKR)')->numeric()->minValue(0)->maxValue(9999999999.99)->prefix('PKR')->helperText('Leave empty for Request a Quote.'),
            TextInput::make('sort_order')->label('Display order')->integer()->minValue(0)->default(0)->required(),
        ])->columns(3);

        return $schema->components($sections);
    }

    public static function image(string $name): FileUpload
    {
        return FileUpload::make($name)->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->disk('public')->directory('content/products')->visibility('public')->maxSize(10240);
    }

    public static function measurement(string $name, array $definition): mixed
    {
        $input = match ($definition['kind']) {
            'text' => TextInput::make($name)->maxLength(5000),
            'select' => Select::make($name)->options($definition['options']),
            'integer' => TextInput::make($name)->integer(),
            default => TextInput::make($name)->numeric(),
        };

        return $input->label($definition['label'].($definition['unit'] ? ' ('.$definition['unit'].')' : ''))->helperText($definition['required'] ? 'Required for publishing.' : 'Optional; leave unknown values empty.');
    }
}
