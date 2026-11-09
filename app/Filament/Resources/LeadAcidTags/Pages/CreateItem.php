<?php

namespace App\Filament\Resources\LeadAcidTags\Pages;

use App\Filament\Catalog\Pages\CreateClassification;
use App\Filament\Resources\LeadAcidTags\LeadAcidTagResource;

class CreateItem extends CreateClassification
{
    protected static string $resource = LeadAcidTagResource::class;
}
