<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inverter_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            foreach (['inverter_type', 'phase', 'ip_rating', 'communication_interface', 'wifi', 'bluetooth'] as $field) {
                $table->text($field)->nullable();
            }
            foreach (['operating_voltage_v', 'rated_capacity_kw', 'pv_capacity_w', 'mppt_min_vdc', 'mppt_max_vdc', 'depth_mm', 'width_mm', 'height_mm', 'true_height_mm', 'weight_kg'] as $field) {
                $table->decimal($field, 16, 4)->nullable();
            }
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inverter_specifications');
    }
};
