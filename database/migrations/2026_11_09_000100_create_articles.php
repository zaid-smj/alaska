<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('card_title')->nullable();
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->string('image')->nullable();
            $table->string('mobile_image')->nullable();
            $table->string('legacy_image')->nullable();
            $table->string('legacy_mobile_image')->nullable();
            $table->string('alt_text')->nullable();
            $table->longText('body')->nullable();
            $table->string('status')->default('draft')->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
        });
        foreach (json_decode(file_get_contents(database_path('data/legacy_articles.json')), true, 512, JSON_THROW_ON_ERROR) as $article) {
            DB::table('articles')->insertOrIgnore($article + ['published_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
