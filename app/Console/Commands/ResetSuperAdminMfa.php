<?php

namespace App\Console\Commands;

use App\Enums\AdminRole;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetSuperAdminMfa extends Command
{
    protected $signature = 'admin:reset-super-mfa';

    protected $description = 'Reset MFA for the sole Super Admin after verifying server access';

    public function handle(): int
    {
        $superAdmin = User::where('role', AdminRole::SuperAdmin)->first();

        if (! $superAdmin) {
            $this->error('No Super Admin account exists.');

            return self::FAILURE;
        }

        if (! $this->confirm("Reset MFA and revoke every login session for {$superAdmin->email}?")) {
            $this->warn('No changes were made.');

            return self::SUCCESS;
        }

        $superAdmin->saveAppAuthenticationSecret(null);
        $superAdmin->saveAppAuthenticationRecoveryCodes(null);
        DB::table('sessions')->where('user_id', $superAdmin->id)->delete();

        app(AuditLogger::class)->record(
            'security.mfa_reset',
            "Emergency MFA reset completed for {$superAdmin->email}.",
            $superAdmin,
        );

        $this->info('Super Admin MFA was reset and all login sessions were revoked.');

        return self::SUCCESS;
    }
}
