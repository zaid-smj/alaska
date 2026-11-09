<?php

namespace App\Catalog;

enum ProductFamily: string
{
    case LeadAcid = 'lead-acid';
    case Inverter = 'inverter';
    case Lithium = 'lithium-ion';

    public function label(): string
    {
        return match ($this) {
            self::LeadAcid => 'Lead Acid', self::Inverter => 'Inverters', self::Lithium => 'Lithium',
        };
    }

    public function technology(): string
    {
        return match ($this) {
            self::LeadAcid => 'German Engineering', self::Inverter => 'Dual Output Smart Inverters', self::Lithium => 'LiFePO₄',
        };
    }

    public function documentSlots(): array
    {
        return $this === self::LeadAcid ? ['datasheet' => 'Product Datasheet', 'other' => 'Other Documents'] : ['datasheet' => 'Product Datasheet', 'manual' => 'User Manual', 'installation' => 'Installation Guide', 'other' => 'Other Documents'];
    }
}
