<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Preserve the exact original text as one entry; do not guess delimiters.
        foreach (DB::table('products')->where('type', 'lead-acid')->whereNull('recommended_uses')->whereNotNull('uses')->get() as $product) {
            if (trim($product->uses) !== '') {
                DB::table('products')->where('id', $product->id)->update(['recommended_uses' => json_encode([$product->uses])]);
            }
        }
    }

    public function down(): void
    {
        // Leave preserved editorial content intact.
    }
};
