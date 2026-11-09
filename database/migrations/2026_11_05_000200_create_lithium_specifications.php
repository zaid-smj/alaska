<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lithium_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            foreach (['model_number', 'battery_type', 'installation_type', 'ip_rating', 'communication_interface', 'terminal_type', 'extra_dimension_label', 'cycle_life_conditions', 'cell_configuration', 'self_discharge_period', 'operating_humidity', 'protection', 'display', 'energy_unit', 'wifi', 'bluetooth'] as $field) {
                $table->text($field)->nullable();
            }
            foreach (['cycle_life_cycles', 'max_parallel_connections', 'max_series_connections'] as $field) {
                $table->unsignedInteger($field)->nullable();
            }
            foreach (['nominal_voltage_v', 'nominal_capacity_ah', 'nominal_energy_wh', 'length_mm', 'width_mm', 'height_mm', 'extra_dimension_mm', 'weight_kg', 'charge_voltage_min_v', 'charge_voltage_max_v', 'discharge_cutoff_voltage_v', 'nominal_charge_current_a', 'max_charge_current_a', 'nominal_discharge_current_a', 'max_continuous_discharge_current_a', 'max_pulse_discharge_current_a', 'pulse_duration_s', 'depth_of_discharge_percent', 'internal_resistance_mohm', 'self_discharge_percent', 'charging_temp_min_c', 'charging_temp_max_c', 'discharging_temp_min_c', 'discharging_temp_max_c', 'storage_temp_min_c', 'storage_temp_max_c', 'max_altitude_m'] as $field) {
                $table->decimal($field, 16, 4)->nullable();
            }
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lithium_specifications');
    }
};
