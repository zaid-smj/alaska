<?php

namespace App\Catalog;

use App\Models\Catalog\InverterSpecification;
use App\Models\Catalog\LeadAcidSpecification;
use App\Models\Catalog\LithiumSpecification;

/** One schema for typed persistence, validation, Filament and the developer contract. */
class SpecificationFields
{
    public static function field(string $label, string $kind = 'decimal', ?string $unit = null, bool $required = true, ?string $toggle = null, string $classification = 'main', array $options = []): array
    {
        return compact('label', 'kind', 'unit', 'required', 'toggle', 'classification', 'options');
    }

    public static function for(string $family): array
    {
        $f = fn ($label, $kind = 'decimal', $unit = null, $required = true, $toggle = null, $classification = 'main', $options = []) => self::field($label, $kind, $unit, $required, $toggle, $classification, $options);

        return match ($family) {
            'lead-acid' => [
                'cca' => $f('CCA (Cold Cranking Amperes)', 'text', null, true, 'cca', 'secondary'),
                'reserve_capacity' => $f('RC (Reserve Capacity)', 'text', null, true, 'reserve_capacity', 'secondary'),
                'terminal_type' => $f('Terminal Type', 'text', null, true, 'terminal_type', 'secondary'),
                'terminal_layout' => $f('Terminal Layout', 'text', null, true, 'terminal_layout', 'secondary'),
                'depth_mm' => $f('Depth', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'width_mm' => $f('Width', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'height_mm' => $f('Height', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'true_height_mm' => $f('True Height', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'dry_weight_kg' => $f('Dry Weight', 'decimal', 'kg', true, 'dry_weight', 'secondary'),
            ],
            'inverter' => [
                'inverter_type' => $f('Type', 'text', null, false),
                'operating_voltage_v' => $f('Operating Voltage', 'decimal', 'V', true, 'operating_voltage'),
                'rated_capacity_kw' => $f('Rated Capacity', 'decimal', 'kW', true, 'rated_capacity'),
                'phase' => $f('Phase', 'select', null, true, 'phase', 'main', ['1P' => '1P', '3P' => '3P']),
                'pv_capacity_w' => $f('PV Capacity', 'decimal', 'W', true, 'pv_capacity'),
                'mppt_min_vdc' => $f('MPPT Voltage Minimum', 'decimal', 'VDC', true, 'mppt_voltage'),
                'mppt_max_vdc' => $f('MPPT Voltage Maximum', 'decimal', 'VDC', true, 'mppt_voltage'),
                'ip_rating' => $f('IP Rating', 'text', null, true, 'ip_rating'),
                'communication_interface' => $f('Communication Interface', 'text', null, false),
                'depth_mm' => $f('Depth', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'width_mm' => $f('Width', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'height_mm' => $f('Height', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'true_height_mm' => $f('True Height', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'weight_kg' => $f('Weight', 'decimal', 'kg', true, 'weight', 'secondary'),
                'wifi' => $f('Wi-Fi', 'select', null, false, 'wifi', 'main', ['available' => 'Available', 'not_available' => 'Not Available']),
                'bluetooth' => $f('Bluetooth', 'select', null, false, 'bluetooth', 'main', ['available' => 'Available', 'optional' => 'Optional', 'not_specified' => 'Not specified']),
            ],
            'lithium-ion' => [
                'model_number' => $f('Model Number', 'text', null, false, null, 'main'),
                'battery_type' => $f('Battery Type', 'text', null, false, null, 'main'),
                'installation_type' => $f('Installation Type', 'text', null, false, null, 'main'),
                'nominal_voltage_v' => $f('Nominal Voltage', 'decimal', 'V', true, 'nominal_voltage', 'main'),
                'nominal_capacity_ah' => $f('Nominal Capacity', 'decimal', 'Ah', true, 'nominal_capacity', 'main'),
                'nominal_energy_wh' => $f('Nominal Energy', 'decimal', 'Wh', true, 'nominal_energy', 'main'),
                'ip_rating' => $f('IP Rating', 'text', null, true, 'ip_rating', 'main'),
                'communication_interface' => $f('Communication Interface', 'text', null, false, null, 'main'),
                'terminal_type' => $f('Terminal Type', 'text', null, true, 'terminal_type', 'secondary'),
                'length_mm' => $f('Length', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'width_mm' => $f('Width', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'height_mm' => $f('Height', 'decimal', 'mm', true, 'dimensions', 'secondary'),
                'extra_dimension_label' => $f('Extra Dimension Label', 'text', null, false, 'dimensions', 'secondary'),
                'extra_dimension_mm' => $f('Extra Dimension Value', 'decimal', 'mm', false, 'dimensions', 'secondary'),
                'weight_kg' => $f('Weight', 'decimal', 'kg', true, 'weight', 'secondary'),
                'charge_voltage_min_v' => $f('Charge / Operating Voltage Minimum', 'decimal', 'V', true, 'charge_voltage', 'main'),
                'charge_voltage_max_v' => $f('Charge / Operating Voltage Maximum', 'decimal', 'V', true, 'charge_voltage', 'main'),
                'discharge_cutoff_voltage_v' => $f('Discharge Cut-off Voltage', 'decimal', 'V', true, 'discharge_cutoff_voltage', 'main'),
                'nominal_charge_current_a' => $f('Nominal Charge Current', 'decimal', 'A', true, 'nominal_charge_current', 'main'),
                'max_charge_current_a' => $f('Maximum Charge Current', 'decimal', 'A', true, 'max_charge_current', 'main'),
                'nominal_discharge_current_a' => $f('Nominal Discharge Current', 'decimal', 'A', true, 'nominal_discharge_current', 'main'),
                'max_continuous_discharge_current_a' => $f('Max Continuous Discharge Current', 'decimal', 'A', true, 'max_continuous_discharge_current', 'main'),
                'max_pulse_discharge_current_a' => $f('Max Pulse Discharge Current', 'decimal', 'A', true, 'max_pulse_discharge_current', 'main'),
                'pulse_duration_s' => $f('Pulse Duration', 'decimal', 'seconds', false, 'max_pulse_discharge_current', 'main'),
                'cycle_life_cycles' => $f('Cycle Life', 'integer', 'cycles', true, 'cycle_life', 'main'),
                'cycle_life_conditions' => $f('Cycle Life Conditions', 'text', null, false, 'cycle_life', 'main'),
                'depth_of_discharge_percent' => $f('Depth of Discharge (DOD)', 'decimal', '%', true, 'depth_of_discharge', 'main'),
                'max_parallel_connections' => $f('Max Parallel Connection', 'integer', null, true, 'max_parallel_connections', 'main'),
                'max_series_connections' => $f('Max Series Connection', 'integer', null, true, 'max_series_connections', 'main'),
                'cell_configuration' => $f('Cell Configuration', 'text', null, true, 'cell_configuration', 'main'),
                'internal_resistance_mohm' => $f('Internal Resistance', 'decimal', 'mΩ', true, 'internal_resistance', 'main'),
                'self_discharge_percent' => $f('Self-Discharge Rate', 'decimal', '%', true, 'self_discharge', 'main'),
                'self_discharge_period' => $f('Self-Discharge Period', 'text', null, true, 'self_discharge', 'main'),
                'charging_temp_min_c' => $f('Charging Temperature Minimum', 'decimal', '°C', true, 'charging_temperature', 'main'),
                'charging_temp_max_c' => $f('Charging Temperature Maximum', 'decimal', '°C', true, 'charging_temperature', 'main'),
                'discharging_temp_min_c' => $f('Discharging Temperature Minimum', 'decimal', '°C', true, 'discharging_temperature', 'main'),
                'discharging_temp_max_c' => $f('Discharging Temperature Maximum', 'decimal', '°C', true, 'discharging_temperature', 'main'),
                'storage_temp_min_c' => $f('Storage Temperature Minimum', 'decimal', '°C', true, 'storage_temperature', 'main'),
                'storage_temp_max_c' => $f('Storage Temperature Maximum', 'decimal', '°C', true, 'storage_temperature', 'main'),
                'operating_humidity' => $f('Operating Humidity', 'text', null, true, 'operating_humidity', 'main'),
                'max_altitude_m' => $f('Max Operating Altitude', 'decimal', 'm', true, 'max_altitude', 'main'),
                'protection' => $f('Protection', 'text', null, true, 'protection', 'main'),
                'display' => $f('Display', 'text', null, false, 'display', 'main'),
                'energy_unit' => $f('Energy Input Unit', 'select', null, true, 'nominal_energy', 'main', ['Wh' => 'Wh', 'kWh' => 'kWh']),
                'wifi' => $f('Wi-Fi', 'select', null, false, 'wifi', 'main', ['available' => 'Available', 'not_available' => 'Not Available']),
                'bluetooth' => $f('Bluetooth', 'select', null, false, 'bluetooth', 'main', ['available' => 'Available', 'optional' => 'Optional', 'not_specified' => 'Not specified']),
            ],
            default => [],
        };
    }

    public static function shared(string $family): array
    {
        $fields = ['short_warranty_months' => self::field('Short Warranty', 'integer', 'months', false, 'short_warranty')];
        if ($family === 'lead-acid') {
            $fields += [
                'plates' => self::field('Plates', 'integer', null, true, 'plates'),
                'voltage' => self::field('Voltage', 'decimal', 'V', true, 'voltage'),
                'capacity_ah' => self::field('Capacity', 'decimal', 'Ah', true, 'capacity'),
                'box_size' => self::field('Box Size', 'text', null, true, 'box_size', 'secondary'),
            ];
        }

        return $fields;
    }

    public static function toggles(string $family): array
    {
        return array_values(array_unique(array_filter(array_column(array_merge(self::shared($family), self::for($family)), 'toggle'))));
    }

    public static function ranges(string $family): array
    {
        return match ($family) {
            'inverter' => [['mppt_min_vdc', 'mppt_max_vdc']],
            'lithium-ion' => [['charge_voltage_min_v', 'charge_voltage_max_v'], ['charging_temp_min_c', 'charging_temp_max_c'], ['discharging_temp_min_c', 'discharging_temp_max_c'], ['storage_temp_min_c', 'storage_temp_max_c']],
            default => [],
        };
    }

    public static function featureSuggestions(string $family): array
    {
        return match ($family) {
            'inverter' => ['High Reliability', 'Built-in Transformer Isolation', 'Built-in Powerful Optimizer', 'More Convenient Charging', 'High Compatibility', 'Enhanced Surge-Power Protection', 'Cost-Effective Energy Conversion'],
            'lithium-ion' => ['Built-in Intelligent BMS', 'Charge and Discharge Current Limitations', 'Automatic Overcharge / Over-discharge Protection', 'Temperature Protection', 'High Reliability Design', 'Long Cycle Life', 'LiFePO₄ Cell Technology', 'Maintenance-Free Operation', 'Parallel Expansion (where supported)', 'Compatible with Rectifiers, Inverters and UPS (where supported)'],
            default => [],
        };
    }

    public static function model(string $family): string
    {
        return match ($family) {
            'lead-acid' => LeadAcidSpecification::class,
            'inverter' => InverterSpecification::class,
            'lithium-ion' => LithiumSpecification::class,
        };
    }
}
