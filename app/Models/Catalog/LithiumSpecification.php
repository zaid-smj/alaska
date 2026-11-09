<?php

namespace App\Models\Catalog;

use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Illuminate\Validation\ValidationException;

class LithiumSpecification extends FamilySpecification
{
    public static function family(): string
    {
        return 'lithium-ion';
    }

    public static function normalizeEnergy(mixed $value, ?string $unit): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (! is_numeric($value) || ! in_array($unit, ['Wh', 'kWh'], true)) {
            throw ValidationException::withMessages(['energy_value' => 'Enter a numeric energy and select Wh or kWh.']);
        }

        return (string) BigDecimal::of((string) $value)->multipliedBy($unit === 'kWh' ? '1000' : '1')->toScale(4, RoundingMode::HalfUp);
    }

    public function energyIn(string $unit = 'Wh'): ?string
    {
        if (! in_array($unit, ['Wh', 'kWh'], true)) {
            throw new \InvalidArgumentException('Energy unit must be Wh or kWh.');
        }
        if ($this->nominal_energy_wh === null) {
            return null;
        }

        return (string) BigDecimal::of($this->nominal_energy_wh)->dividedBy($unit === 'kWh' ? '1000' : '1', $unit === 'kWh' ? 7 : 4, RoundingMode::Unnecessary);
    }
}
