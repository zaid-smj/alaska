<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\Articles\Pages\CreateArticle;
use App\Filament\Resources\Articles\Pages\EditArticle;
use App\Filament\Resources\Articles\Pages\ListArticles;
use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class ArticlesTest extends TestCase
{
    use RefreshDatabase;

    private function published(array $data = []): Article
    {
        $path = UploadedFile::fake()->image('article.png')->store('content/articles', 'public');

        return Article::create(array_replace(['title' => 'New Article', 'category' => 'News', 'body' => '<h2>Helpful article</h2><p>Real article text.</p>', 'image' => $path, 'status' => 'published', 'sort_order' => 0], $data));
    }

    public function test_existing_six_articles_are_imported_without_content_loss(): void
    {
        $fixture = json_decode(file_get_contents(database_path('data/legacy_articles.json')), true);
        $this->assertSame(6, Article::count());
        foreach ($fixture as $old) {
            $article = Article::where('slug', $old['slug'])->firstOrFail();
            foreach ($old as $field => $value) {
                $this->assertSame($value, $article->$field);
            }
            $this->assertNotEmpty($article->image_url);
        }
        $this->get('/news.html')->assertOk()->assertSee('articles')->assertSee('Best Battery for Vehicle or Solar');
    }

    public function test_admins_can_create_edit_publish_hide_and_delete_articles(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => AdminRole::Admin]));
        Livewire::test(CreateArticle::class)->fillForm(['title' => 'Student Test Article', 'status' => 'draft', 'sort_order' => 3])->call('create')->assertHasNoFormErrors();
        $article = Article::where('title', 'Student Test Article')->firstOrFail();
        $slug = $article->slug;
        $path = UploadedFile::fake()->image('article.png')->store('content/articles', 'public');
        Livewire::test(EditArticle::class, ['record' => $article->id])->fillForm(['title' => 'Updated Article', 'category' => 'Tips', 'body' => '<p>Updated useful content.</p>', 'image' => [$path], 'status' => 'published'])->call('save')->assertHasNoFormErrors();
        $this->assertSame($slug, $article->fresh()->slug);
        $this->assertNotNull($article->fresh()->published_at);
        $this->get('/news.html')->assertSee('Updated Article')->assertSee('Updated useful content.');
        Livewire::test(EditArticle::class, ['record' => $article->id])->fillForm(['status' => 'hidden'])->call('save')->assertHasNoFormErrors();
        $this->get('/news.html')->assertDontSee('Updated useful content.');
        Livewire::test(EditArticle::class, ['record' => $article->id])->callAction('delete');
        $this->assertDatabaseMissing('articles', ['id' => $article->id]);
    }

    public function test_drafts_allow_missing_content_but_publication_is_server_validated(): void
    {
        $article = Article::create(['title' => 'Incomplete draft']);
        $this->assertSame('draft', $article->status);
        $this->expectException(ValidationException::class);
        $article->update(['status' => 'published']);
    }

    public function test_only_published_due_articles_are_exposed_and_deleted_content_does_not_return(): void
    {
        Storage::fake('public');
        $draft = $this->published(['title' => 'Never Show Draft', 'status' => 'draft']);
        $hidden = $this->published(['title' => 'Never Show Hidden', 'status' => 'hidden']);
        $scheduled = $this->published(['title' => 'Scheduled Article', 'published_at' => now()->addDay()]);
        $visible = $this->published(['title' => 'Visible Article']);
        $this->get('/news.html')->assertSee('Visible Article')->assertDontSee('Never Show Draft')->assertDontSee('Never Show Hidden')->assertDontSee('Scheduled Article');
        foreach (Article::all() as $article) {
            $article->delete();
        }
        $this->get('/news.html')->assertOk()->assertDontSee('Best Battery for Vehicle or Solar')->assertDontSee('Visible Article')->assertSee('No articles found.');
        $this->assertSame([], Article::published()->get()->all());
    }

    public function test_stable_unique_slugs_and_sanitized_content(): void
    {
        Storage::fake('public');
        $one = $this->published(['title' => 'Same Name', 'body' => '<p>Safe text</p><script>alert(1)</script><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">Link</a>']);
        $two = $this->published(['title' => 'Same Name']);
        $this->assertSame('same-name', $one->slug);
        $this->assertSame('same-name-2', $two->slug);
        $one->update(['title' => 'Rename']);
        $this->assertSame('same-name', $one->fresh()->slug);
        $this->assertStringNotContainsString('<script', $one->safe_body);
        $this->assertStringNotContainsString('onerror', $one->safe_body);
        $this->assertStringNotContainsString('javascript:', $one->safe_body);
    }

    public function test_images_order_permissions_and_validation(): void
    {
        Storage::fake('public');
        $first = $this->published(['title' => 'First Article', 'sort_order' => 2]);
        $second = $this->published(['title' => 'Second Article', 'sort_order' => 1]);
        $this->assertSame([$second->id, $first->id], Article::published()->whereIn('id', [$first->id, $second->id])->pluck('id')->all());
        $this->assertSame($first->image_url, $first->mobile_image_url);
        foreach (AdminRole::cases() as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]));
            Livewire::test(ListArticles::class)->assertSuccessful();
        }
        $this->actingAs(User::factory()->create(['role' => AdminRole::ContentManager, 'is_active' => false]));
        Livewire::test(ListArticles::class)->assertForbidden();
        Storage::disk('public')->put('content/articles/fake.webp', 'not an image');
        $this->expectException(ValidationException::class);
        $first->update(['image' => 'content/articles/fake.webp']);
    }
}
