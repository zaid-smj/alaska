<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->boolean('can_manage_content')->default(false));
        Schema::create('sales_attachments', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('session_hash', 64);
            $t->string('path');
            $t->string('original_name');
            $t->string('mime');
            $t->unsignedInteger('size');
            $t->foreignId('sales_request_id')->nullable()->constrained()->restrictOnDelete();
            $t->timestamp('expires_at')->index();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_attachments');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('can_manage_content'));
    }
};
