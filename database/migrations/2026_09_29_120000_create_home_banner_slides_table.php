<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_banner_slides', function (Blueprint $table) {
            $table->id();
            $table->string('kicker')->nullable();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->string('desktop_image')->nullable();
            $table->string('mobile_image')->nullable();
            $table->string('legacy_desktop_path')->nullable();
            $table->string('legacy_mobile_path')->nullable();
            $table->string('alt_text');
            $table->string('primary_button_label')->nullable();
            $table->string('primary_button_url')->nullable();
            $table->string('secondary_button_label')->nullable();
            $table->string('secondary_button_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        $now = now();

        DB::table('home_banner_slides')->insert([
            [
                'kicker' => 'Placeholder',
                'title' => 'Placeholder Title',
                'subtitle' => 'Placeholder text for banner.',
                'legacy_desktop_path' => 'assets/slider-home/slide-1.webp',
                'legacy_mobile_path' => 'assets/solutions/mobile/automotive-mobile.webp',
                'alt_text' => 'Automotive banner',
                'primary_button_label' => 'View More',
                'primary_button_url' => '#',
                'secondary_button_label' => 'Get Support',
                'secondary_button_url' => '#',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'kicker' => 'Placeholder',
                'title' => 'Placeholder Title',
                'subtitle' => 'Placeholder text for banner.',
                'legacy_desktop_path' => 'assets/slider-home/slide-2.webp',
                'legacy_mobile_path' => 'assets/solutions/mobile/solar-mobile.webp',
                'alt_text' => 'Solar banner',
                'primary_button_label' => 'Explore',
                'primary_button_url' => '#',
                'secondary_button_label' => 'Find Partner',
                'secondary_button_url' => '#',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'kicker' => 'Placeholder',
                'title' => 'Placeholder Title',
                'subtitle' => 'Placeholder text for banner.',
                'legacy_desktop_path' => 'assets/slider-home/slide-3.webp',
                'legacy_mobile_path' => 'assets/solutions/mobile/industrial-mobile.webp',
                'alt_text' => 'Industrial banner',
                'primary_button_label' => 'View More',
                'primary_button_url' => '#',
                'secondary_button_label' => 'Get Support',
                'secondary_button_url' => '#',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_banner_slides');
    }
};
