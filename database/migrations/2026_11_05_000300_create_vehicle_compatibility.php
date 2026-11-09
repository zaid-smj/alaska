<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_makes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_make_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['vehicle_make_id', 'name']);
        });
        Schema::create('vehicle_fitments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_model_id')->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('year_from');
            $table->unsignedSmallInteger('year_to');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['vehicle_model_id', 'year_from', 'year_to'], 'vehicle_fitments_model_years_unique');
        });
        Schema::create('vehicle_product_compatibilities', function (Blueprint $table) {
            $table->foreignId('vehicle_fitment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['vehicle_fitment_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_product_compatibilities');
        Schema::dropIfExists('vehicle_fitments');
        Schema::dropIfExists('vehicle_models');
        Schema::dropIfExists('vehicle_makes');
    }
};
