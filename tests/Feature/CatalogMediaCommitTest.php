<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\NavbarImage;
use App\Models\Product;
use App\Services\Catalog\ProductEditor;
use Illuminate\Database\DatabaseTransactionsManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\RefreshDatabaseState;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Real commits in the isolated testing database exercise after-commit cleanup. */
class CatalogMediaCommitTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = [];

    protected function setUp(): void
    {
        parent::setUp();
        // Laravel's testing manager treats level 1 as the wrapper transaction.
        // This class intentionally uses real commits and therefore needs the
        // production manager (callbacks only at the actual outer commit).
        $manager = new DatabaseTransactionsManager;
        $this->app->instance('db.transactions', $manager);
        DB::connection()->setTransactionManager($manager);
    }

    protected function tearDown(): void
    {
        while (DB::connection()->transactionLevel() > 0) {
            DB::rollBack();
        }
        RefreshDatabaseState::$migrated = false;
        parent::tearDown();
    }

    public function test_replaced_and_deleted_media_are_removed_only_after_successful_commit(): void
    {
        $this->assertSame('testing', DB::connection()->getDatabaseName());
        Storage::fake('public');
        $first = UploadedFile::fake()->image('first.png')->store('content/products', 'public');
        $second = UploadedFile::fake()->image('second.png')->store('content/products', 'public');
        $product = app(ProductEditor::class)->save(new Product, ['name' => 'Media test', 'image' => $first, 'gallery' => [['path' => $second]]], 'lead-acid');
        DB::beginTransaction();
        $product->update(['image' => $second]);
        Storage::disk('public')->assertExists($first);
        DB::rollBack();
        Storage::disk('public')->assertExists($first);
        $product->refresh()->update(['image' => $second]);
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($second);
        $product->delete();
        Storage::disk('public')->assertMissing($second);
    }

    public function test_article_cleanup_preserves_shared_navbar_files_and_rollback(): void
    {
        Storage::fake('public');
        $first = UploadedFile::fake()->image('article.png')->store('content/articles', 'public');
        $second = UploadedFile::fake()->image('replacement.png')->store('content/articles', 'public');
        $article = Article::create(['title' => 'Cleanup article', 'image' => $first]);
        DB::beginTransaction();
        $article->update(['image' => $second]);
        Storage::disk('public')->assertExists($first);
        DB::rollBack();
        Storage::disk('public')->assertExists($first);
        $article->refresh()->update(['image' => $second]);
        Storage::disk('public')->assertMissing($first);
        $navbar = NavbarImage::firstOrFail();
        $navbar->update(['image' => $second]);
        $article->delete();
        Storage::disk('public')->assertExists($second);
        $navbar->update(['image' => null]);
        Storage::disk('public')->assertMissing($second);
    }
}
