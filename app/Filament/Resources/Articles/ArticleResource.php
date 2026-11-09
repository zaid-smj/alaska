<?php

namespace App\Filament\Resources\Articles;

use App\Filament\Resources\CatalogResource;
use App\Models\Article;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class ArticleResource extends CatalogResource
{
    protected static ?string $model = Article::class;

    protected static ?string $cluster = null;

    protected static string|UnitEnum|null $navigationGroup = 'Content Management';

    protected static ?string $navigationLabel = 'News / Articles';

    protected static ?string $recordTitleAttribute = 'title';

    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Article information')->schema([
                TextInput::make('title')->required()->maxLength(255), TextInput::make('card_title')->label('Short card title (optional)')->maxLength(255)->helperText('Leave empty to use the full title on the News card.'),
                TextInput::make('category')->label('Category label')->maxLength(255)->required(fn ($get) => $get('status') === 'published'),
                TextInput::make('slug')->label('Article identifier')->disabled()->dehydrated(false)->helperText('Generated once on creation; retained when the title changes.'),
            ])->columns(2),
            Section::make('Images')->schema([
                ...collect(['image' => 'Main image', 'mobile_image' => 'Mobile image (optional)'])->map(fn ($label, $field) => FileUpload::make($field)->label($label)->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->disk('public')->directory('content/articles')->visibility('public')->maxSize(10240)->helperText('Up to 10 MB. Existing bundled images remain unless replaced; mobile falls back to the main image.'))->values()->all(),
                TextInput::make('alt_text')->label('Image description')->maxLength(255),
            ])->columns(2),
            Section::make('Article text')->schema([RichEditor::make('body')->label('Content')->toolbarButtons([['bold', 'italic', 'underline', 'link'], ['h2', 'h3', 'bulletList', 'orderedList', 'blockquote'], ['undo', 'redo']])->required(fn ($get) => $get('status') === 'published')->columnSpanFull()])->columnSpanFull(),
            Section::make('Publication')->schema([
                Select::make('status')->options(Article::STATUSES)->default('draft')->required()->live(),
                DateTimePicker::make('published_at')->label('Publish at')->helperText('Optional. Publishing without a date uses the current time. Future dates schedule visibility.'),
                TextInput::make('sort_order')->label('Display order')->integer()->minValue(0)->default(0)->required(),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort_order')->reorderable('sort_order')->columns([
            ImageColumn::make('image_url')->label('Image'), TextColumn::make('title')->searchable()->sortable(), TextColumn::make('category')->searchable(), TextColumn::make('status')->badge(), TextColumn::make('published_at')->dateTime()->sortable(), TextColumn::make('sort_order')->sortable(),
        ])->filters([SelectFilter::make('status')->options(Article::STATUSES)])->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListArticles::route('/'), 'create' => Pages\CreateArticle::route('/create'), 'edit' => Pages\EditArticle::route('/{record}/edit')];
    }
}
