<?php

namespace App\Filament\Resources\WarrantyClaims\Pages;

use App\Filament\Resources\WarrantyClaims\WarrantyClaimResource;
use Filament\Resources\Pages\ListRecords;

class ListClaims extends ListRecords
{
    protected static string $resource = WarrantyClaimResource::class;
}
