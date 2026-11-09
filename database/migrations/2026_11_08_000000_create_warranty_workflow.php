<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->boolean('can_manage_warranties')->default(false));
        Schema::create('warranty_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('submission_key')->unique();
            $table->string('session_hash', 64);
            $table->string('payload_hash', 64);
            $table->string('identity_hash', 64)->unique();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            foreach (['name', 'phone', 'email', 'city', 'product_type', 'product_model', 'serial_number', 'card_number', 'dealer'] as $column) {
                $table->string($column);
            }
            $table->date('purchase_date');
            $table->timestamp('registered_at')->index();
            $table->timestamp('confirmed_at');
            $table->timestamp('consented_at');
            $table->json('form_snapshot');
            $table->unsignedSmallInteger('form_version')->default(1);
            $table->timestamps();
        });
        Schema::create('warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('submission_key')->unique();
            $table->string('session_hash', 64);
            $table->string('payload_hash', 64);
            $table->foreignId('warranty_registration_id')->nullable()->constrained()->restrictOnDelete();
            foreach (['name', 'phone', 'email', 'city', 'product_type', 'product_model', 'serial_number', 'dealer', 'issue'] as $column) {
                $table->string($column);
            }
            $table->string('card_number')->nullable();
            $table->string('registration_reference')->nullable();
            $table->date('purchase_date');
            $table->date('problem_started_on');
            $table->text('usage')->nullable();
            $table->text('description');
            $table->string('registration_state');
            $table->string('status')->default('new')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('claimed_at')->index();
            $table->timestamp('confirmed_at');
            $table->timestamp('consented_at');
            $table->json('form_snapshot');
            $table->unsignedSmallInteger('form_version')->default(1);
            $table->timestamps();
        });
        Schema::create('warranty_claim_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warranty_claim_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event');
            $table->json('changes')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
        Schema::create('warranty_uploads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_hash', 64);
            $table->string('path');
            $table->string('original_name');
            $table->string('mime');
            $table->unsignedInteger('size');
            $table->json('extracted_fields')->nullable();
            $table->string('extraction_status')->default('pending');
            $table->text('extraction_message')->nullable();
            $table->foreignId('warranty_registration_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('warranty_claim_id')->nullable()->constrained()->restrictOnDelete();
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warranty_uploads');
        Schema::dropIfExists('warranty_claim_activities');
        Schema::dropIfExists('warranty_claims');
        Schema::dropIfExists('warranty_registrations');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('can_manage_warranties'));
    }
};
