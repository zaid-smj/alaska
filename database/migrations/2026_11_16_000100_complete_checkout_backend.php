<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_checkout_settings', function (Blueprint $t) {
            $t->id();
            $t->boolean('checkout_enabled')->default(false);
            $t->boolean('bank_transfer_enabled')->default(true);
            $t->boolean('cod_enabled')->default(true);
            $t->unsignedBigInteger('shipping_fee_cents')->default(50000);
            $t->foreignId('shipping_tax_profile_id')->nullable()->constrained('sales_tax_profiles')->restrictOnDelete();
            $t->json('bank_accounts')->nullable();
            $t->text('bank_transfer_instructions')->nullable();
            $t->text('cod_instructions')->nullable();
            $t->timestamps();
        });
        DB::table('sales_checkout_settings')->insert(['id' => 1, 'shipping_fee_cents' => 50000, 'checkout_enabled' => false, 'bank_transfer_enabled' => true, 'cod_enabled' => true, 'created_at' => now(), 'updated_at' => now()]);
        Schema::create('sales_checkout_previews', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('session_hash', 64);
            $t->string('fingerprint', 64);
            $t->string('payment_method');
            $t->json('items');
            $t->json('snapshot');
            $t->timestamp('expires_at')->index();
            $t->timestamps();
        });
        Schema::table('sales_requests', function (Blueprint $t) {
            $t->foreignUuid('checkout_preview_id')->nullable()->unique()->constrained('sales_checkout_previews')->restrictOnDelete();
            $t->string('payment_method')->nullable()->index();
            $t->string('payment_status')->nullable()->index();
            $t->foreignId('payment_status_recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('payment_status_recorded_at')->nullable();
            $t->string('payment_status_reference')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('sales_requests', function (Blueprint $t) {
            $t->dropConstrainedForeignId('payment_status_recorded_by');
            $t->dropConstrainedForeignId('checkout_preview_id');
            $t->dropColumn(['payment_method', 'payment_status', 'payment_status_recorded_at', 'payment_status_reference']);
        });
        Schema::dropIfExists('sales_checkout_previews');
        Schema::dropIfExists('sales_checkout_settings');
    }
};
