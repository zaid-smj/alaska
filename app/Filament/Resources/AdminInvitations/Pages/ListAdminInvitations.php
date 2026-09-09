<?php

namespace App\Filament\Resources\AdminInvitations\Pages;

use App\Filament\Resources\AdminInvitations\AdminInvitationResource;
use Filament\Resources\Pages\ListRecords;

class ListAdminInvitations extends ListRecords
{
    protected static string $resource = AdminInvitationResource::class;
}
