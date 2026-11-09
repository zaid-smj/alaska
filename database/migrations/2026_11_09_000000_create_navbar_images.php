<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('navbar_images', function (Blueprint $table) {
            $table->id();
            $table->string('slot')->unique();
            $table->string('image')->nullable();
            $table->string('alt_text')->nullable();
            $table->timestamps();
        });
        foreach (['solutions', 'technology', 'partners', 'warranty', 'info', 'about', 'graphite-light', 'graphite-dark', 'calcium-light', 'calcium-dark', 'lifepo4-light', 'lifepo4-dark', 'brand-light', 'brand-dark'] as $slot) {
            DB::table('navbar_images')->insertOrIgnore(['slot' => $slot, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('navbar_images');
    }
};
