<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_sections', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type')->default('lead-acid')->index();
            $table->string('status')->default('draft')->index();
            $table->string('image')->nullable();
            $table->string('legacy_image_path')->nullable();
            $table->string('alt_text');
            $table->text('description')->nullable();
            $table->decimal('price_pkr', 12, 2)->nullable();
            $table->unsignedSmallInteger('plates')->nullable();
            $table->decimal('voltage', 8, 2)->nullable();
            $table->decimal('capacity_ah', 10, 2)->nullable();
            $table->string('warranty')->nullable();
            $table->decimal('weight_kg', 10, 3)->nullable();
            $table->string('box_size')->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->string('dimension_unit')->default('mm');
            $table->json('tags')->nullable();
            $table->text('uses')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('product_product_section', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_section_id')->constrained()->cascadeOnDelete();
            $table->primary(['product_id', 'product_section_id']);
        });
        Schema::create('catalog_banners', function (Blueprint $table) {
            $table->id();
            $table->string('title')->default('Lead Acid Batteries');
            $table->text('subtitle')->nullable();
            $table->string('image')->nullable();
            $table->string('mobile_image')->nullable();
            $table->string('alt_text')->default('Alaska battery solutions');
            $table->timestamps();
        });
        foreach (['Dry Charge', 'Deep Cycle', 'Maintenance Free', 'Motorcycle', 'Tubular', 'Special Batteries'] as $order => $name) {
            DB::table('product_sections')->insert(['name' => $name, 'sort_order' => $order + 1, 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('catalog_banners')->insert(['title' => 'Lead Acid Batteries', 'subtitle' => 'Find the right power for your journey, business and backup.', 'alt_text' => 'Alaska battery solutions', 'created_at' => now(), 'updated_at' => now()]);
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_banners');
        Schema::dropIfExists('product_product_section');
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_sections');
    }
};
