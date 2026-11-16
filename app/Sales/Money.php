<?php

namespace App\Sales;

use Illuminate\Validation\ValidationException;

class Money
{
    public static function cents(mixed $value): int
    {
        if (! is_scalar($value) || ! preg_match('/^\d{1,10}(?:\.\d{1,2})?$/', (string) $value)) {
            throw ValidationException::withMessages(['amount' => 'Enter a nonnegative PKR amount with at most two decimal places.']);
        }[$whole,$fraction] = array_pad(explode('.', (string) $value, 2), 2, '');

        return (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
    }

    public static function display(?int $value): string
    {
        return $value === null ? 'To be quoted' : 'PKR '.number_format($value / 100, 2);
    }
}
