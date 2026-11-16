<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_requests', function (Blueprint $t) {
            $t->string('request_kind')->default('quote')->index();
            $t->timestamp('claimed_at')->nullable();
            $t->timestamp('follow_up_at')->nullable()->index();
            $t->string('external_reference')->nullable();
            $t->json('checkout_snapshot')->nullable();
        });
        DB::table('sales_requests')->where('source', 'cart')->update(['request_kind' => 'legacy_cart']);
        Schema::table('products', fn (Blueprint $t) => $t->decimal('tax_retail_price_pkr', 12, 2)->nullable());
        Schema::create('sales_tax_profiles', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('family')->index();
            $t->string('calculation_basis');
            $t->json('product_ids')->nullable();
            $t->json('additional_taxes')->nullable();
            $t->unsignedInteger('rate_basis_points');
            $t->boolean('price_includes_tax');
            $t->string('applicability_notes', 2000);
            $t->string('source_url', 2048);
            $t->date('effective_from');
            $t->date('effective_until')->nullable();
            $t->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('approved_at')->nullable();
            $t->boolean('is_active')->default(false);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_tax_profiles');
        Schema::table('products', fn (Blueprint $t) => $t->dropColumn('tax_retail_price_pkr'));
        Schema::table('sales_requests', fn (Blueprint $t) => $t->dropColumn(['request_kind', 'claimed_at', 'follow_up_at', 'external_reference', 'checkout_snapshot']));
    }
};
