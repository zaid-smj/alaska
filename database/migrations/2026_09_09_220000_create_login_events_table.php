<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event')->index();
            $table->string('attempted_email')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        DB::table('audit_logs')
            ->whereIn('event', ['auth.login', 'auth.logout', 'auth.login_failed'])
            ->orderBy('id')
            ->each(function (object $entry): void {
                $metadata = json_decode($entry->metadata ?? '{}', true);

                DB::table('login_events')->insert([
                    'user_id' => $entry->actor_id,
                    'event' => match ($entry->event) {
                        'auth.login' => 'login',
                        'auth.logout' => 'logout',
                        default => 'failed',
                    },
                    'attempted_email' => $metadata['email'] ?? DB::table('users')->where('id', $entry->actor_id)->value('email'),
                    'ip_address' => $entry->ip_address,
                    'user_agent' => $entry->user_agent,
                    'created_at' => $entry->created_at,
                ]);
            });

        DB::table('audit_logs')
            ->whereIn('event', ['auth.login', 'auth.logout', 'auth.login_failed'])
            ->delete();
    }

    public function down(): void
    {
        Schema::dropIfExists('login_events');
    }
};
