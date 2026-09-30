<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index();
            $table->string('image')->nullable();
            $table->string('legacy_image_path')->nullable();
            $table->string('alt_text');
            $table->string('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['category', 'is_active', 'sort_order']);
        });

        $paths = [
            'corporate' => [
                'assets/gallery/corp/corp-3.jpg',
                'assets/gallery/corp/corp-5.jpg',
                'assets/gallery/corp/corp-6.jpg',
                'assets/gallery/corp/corp-8.jpg',
                'assets/gallery/corp/corp-9.jpg',
                'assets/gallery/corp/corp-10.jpg',
            ],
            'dealer' => [
                'assets/gallery/dealer/d-1.jpg',
                'assets/gallery/dealer/d-2.jpg',
                'assets/gallery/dealer/d-3.jpg',
                'assets/gallery/dealer/d-4.jpg',
                'assets/gallery/dealer/d-5.jpg',
                'assets/gallery/dealer/d-6.jpg',
                'assets/gallery/dealer/d-7.jpg',
                'assets/gallery/dealer/d-8.jpg',
                'assets/gallery/dealer/d-9.jpg',
                'assets/gallery/dealer/d-10.jpg',
                'assets/gallery/dealer/d-11.jpg',
            ],
            'awards' => [
                'assets/gallery/awards/award-2.jpg',
                'assets/gallery/awards/award-3.jpg',
            ],
        ];

        $now = now();

        foreach ($paths as $category => $images) {
            foreach ($images as $index => $path) {
                DB::table('gallery_images')->insert([
                    'category' => $category,
                    'legacy_image_path' => $path,
                    'alt_text' => ucfirst($category).' gallery image '.($index + 1),
                    'sort_order' => $index + 1,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
    }
};
