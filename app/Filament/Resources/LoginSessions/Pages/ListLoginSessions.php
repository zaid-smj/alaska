<?php

namespace App\Filament\Resources\LoginSessions\Pages;

use App\Filament\Resources\LoginSessions\LoginSessionResource;
use Filament\Resources\Pages\ListRecords;

class ListLoginSessions extends ListRecords
{
    protected static string $resource = LoginSessionResource::class;
}
