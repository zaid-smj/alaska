<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['users', 'admin_invitations'] as $table) {
            DB::table($table)->where('role', 'content_manager')->update(['role' => 'marketing']);
        }
        Schema::table('users', fn (Blueprint $t) => $t->boolean('can_manage_sales')->default(false));
        Schema::create('sales_requests', function (Blueprint $t) {
            $t->id();
            $t->string('number')->unique();
            $t->uuid('submission_key')->unique();
            $t->string('session_hash', 64);
            $t->string('payload_hash', 64);
            $t->string('source');
            foreach (['name', 'email', 'phone', 'city'] as $field) {
                $t->string($field);
            }
            $t->string('company')->nullable();
            $t->string('customer_type');
            $t->text('address')->nullable();
            $t->text('message')->nullable();
            $t->json('applications')->nullable();
            $t->string('status')->default('new')->index();
            $t->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $t->unsignedBigInteger('estimate_cents')->nullable();
            $t->string('currency', 3)->default('PKR');
            $t->timestamp('consented_at');
            $t->timestamp('completed_at')->nullable();
            $t->string('tracking_reference')->nullable();
            $t->timestamps();
        });
        Schema::create('sales_request_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sales_request_id')->constrained()->restrictOnDelete();
            $t->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $t->string('name');
            $t->string('category')->nullable();
            $t->unsignedInteger('quantity');
            $t->unsignedBigInteger('unit_price_cents')->nullable();
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('sales_activities', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sales_request_id')->constrained()->restrictOnDelete();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('event');
            $t->json('changes')->nullable();
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('sales_discounts', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('type');
            $t->decimal('value', 12, 2);
            $t->unsignedBigInteger('minimum_cents')->default(0);
            $t->unsignedBigInteger('maximum_cents')->nullable();
            $t->unsignedInteger('usage_limit')->nullable();
            $t->unsignedInteger('usage_count')->default(0);
            $t->timestamp('starts_at')->nullable();
            $t->timestamp('ends_at')->nullable();
            $t->boolean('is_active')->default(true);
            $t->json('customer_types')->nullable();
            $t->json('product_ids')->nullable();
            $t->json('category_ids')->nullable();
            $t->timestamps();
        });
        Schema::create('sales_invoices', function (Blueprint $t) {
            $t->id();
            $t->string('number')->unique();
            $t->foreignId('sales_request_id')->unique()->constrained()->restrictOnDelete();
            $t->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('sales_discount_id')->nullable()->constrained()->nullOnDelete();
            $t->json('customer_snapshot');
            $t->json('lines');
            $t->json('discount_snapshot')->nullable();
            $t->unsignedBigInteger('subtotal_cents');
            $t->unsignedBigInteger('discount_cents');
            $t->unsignedBigInteger('tax_cents');
            $t->unsignedBigInteger('shipping_cents');
            $t->unsignedBigInteger('total_cents');
            $t->string('currency', 3)->default('PKR');
            $t->text('terms');
            $t->timestamp('issued_at');
            $t->timestamps();
        });
        Schema::create('sales_payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sales_invoice_id')->constrained()->restrictOnDelete();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->uuid('entry_key')->unique();
            $t->string('kind');
            $t->unsignedBigInteger('amount_cents');
            $t->text('note');
            $t->timestamp('received_at');
            $t->timestamps();
        });
        Schema::create('dealer_tiers', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->decimal('discount_percent', 5, 2)->nullable();
            $t->unsignedInteger('minimum_units')->nullable();
            $t->text('notes')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['dealer_tiers', 'sales_payments', 'sales_invoices', 'sales_discounts', 'sales_activities', 'sales_request_items', 'sales_requests'] as $table) {
            Schema::dropIfExists($table);
        }Schema::table('users', fn (Blueprint $t) => $t->dropColumn('can_manage_sales'));
        foreach (['users', 'admin_invitations'] as $table) {
            DB::table($table)->where('role', 'marketing')->update(['role' => 'content_manager']);
        }
    }
};
