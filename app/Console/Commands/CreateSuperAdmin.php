<?php

namespace App\Console\Commands;

use App\Enums\AdminRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateSuperAdmin extends Command
{
    protected $signature = 'admin:create-super';

    protected $description = 'Securely create the initial Super Admin account';

    public function handle(): int
    {
        if (User::where('role', AdminRole::SuperAdmin)->exists()) {
            $this->error('A Super Admin account already exists.');

            return self::FAILURE;
        }

        $name = trim((string) $this->ask('Full name'));
        $email = strtolower(trim((string) $this->ask('Email address')));
        $password = (string) $this->secret('Password');
        $passwordConfirmation = (string) $this->secret('Confirm password');

        $validated = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::default()],
        ])->validate();

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'email_verified_at' => now(),
            'password' => $validated['password'],
            'role' => AdminRole::SuperAdmin,
            'is_active' => true,
        ]);

        $this->info('The Super Admin account was created successfully.');

        return self::SUCCESS;
    }
}
