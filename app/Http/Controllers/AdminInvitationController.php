<?php

namespace App\Http\Controllers;

use App\Enums\AdminRole;
use App\Models\AdminInvitation;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AdminInvitationController extends Controller
{
    public function show(string $token)
    {
        $invitation = $this->getValidInvitation($token);

        if (! $invitation) {
            return response()->view('admin.invitations.invalid', status: 404);
        }

        return view('admin.invitations.accept', [
            'invitation' => $invitation,
            'token' => $token,
        ]);
    }

    public function store(Request $request, string $token)
    {
        if (! $this->getValidInvitation($token)) {
            return response()->view('admin.invitations.invalid', status: 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => [
                'required',
                'confirmed',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        DB::transaction(function () use ($validated, $token) {
            $invitation = AdminInvitation::where('token_hash', hash('sha256', $token))
                ->whereNull('accepted_at')
                ->whereNull('revoked_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            abort_unless($invitation, 404);

            if (User::where('email', $invitation->email)->exists()) {
                throw ValidationException::withMessages([
                    'email' => 'An account already exists for this email address. Please contact an administrator.',
                ]);
            }

            $user = User::create([
                'name' => $validated['name'],
                'email' => $invitation->email,
                'email_verified_at' => now(),
                'password' => $validated['password'],
                'role' => AdminRole::Admin,
                'is_active' => true,
            ]);

            $invitation->update([
                'accepted_at' => now(),
            ]);

            app(AuditLogger::class)->record(
                'invitation.accepted',
                "Invitation accepted by {$user->email}.",
                $invitation,
                actor: $user,
            );
        });

        return redirect('/admin')
            ->with('status', 'Admin account created successfully. You can now log in.');
    }

    private function getValidInvitation(string $token): ?AdminInvitation
    {
        return AdminInvitation::where('token_hash', hash('sha256', $token))
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();
    }
}
