<?php

use App\Catalog\ProductFamily;
use App\Catalog\SpecificationFields;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['product_series', 'product_categories', 'product_tags'] as $name) {
            Schema::create($name, function (Blueprint $table) use ($name) {
                $table->id();
                $table->string('family');
                $table->string('name');
                $table->boolean('is_active')->default(true);
                $table->unsignedInteger('sort_order')->default(0);
                if ($name === 'product_categories') {
                    $table->foreignId('legacy_section_id')->nullable()->unique()->constrained('product_sections')->nullOnDelete();
                    $table->text('description')->nullable();
                }
                $table->timestamps();
                $table->unique(['family', 'name']);
            });
        }
        Schema::table('products', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->string('alt_text')->nullable()->change();
            $table->foreignId('series_id')->nullable()->constrained('product_series')->restrictOnDelete();
            $table->foreignId('primary_category_id')->nullable()->constrained('product_categories')->restrictOnDelete();
            $table->string('technology')->nullable();
            $table->unsignedInteger('short_warranty_months')->nullable();
            foreach (['features', 'recommended_uses', 'warranty_details', 'installation_instructions', 'specification_visibility'] as $field) {
                $table->json($field)->nullable();
            }
            $table->text('certifications')->nullable();
            $table->boolean('certifications_visible')->default(true);
            $table->boolean('legacy_publication_exempt')->default(false);
            $table->unique(['type', 'name']);
        });
        Schema::create('product_tag_assignments', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_tag_id')->constrained()->restrictOnDelete();
            $table->primary(['product_id', 'product_tag_id']);
        });
        Schema::create('product_gallery_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('alt_text')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('product_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('slot');
            $table->string('path')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->unique(['product_id', 'slot']);
        });
        Schema::create('lead_acid_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            foreach (SpecificationFields::for('lead-acid') as $field => $definition) {
                if ($definition['kind'] === 'text') {
                    $table->text($field)->nullable();
                } else {
                    $table->decimal($field, 16, 4)->nullable();
                }
            }
            $table->timestamps();
        });
        Schema::table('catalog_banners', function (Blueprint $table) {
            $table->string('family')->default('lead-acid')->unique();
        });

        $now = now();
        foreach (['lead-acid' => ['Royal Series', 'X Series', 'Turbo Series', 'Deep Cycle Series', 'Calcium Silver Series'], 'inverter' => ['Solar Inverters'], 'lithium-ion' => ['Life Series']] as $family => $names) {
            foreach ($names as $order => $name) {
                DB::table('product_series')->insertOrIgnore(compact('family', 'name') + ['sort_order' => $order, 'created_at' => $now, 'updated_at' => $now]);
            }
        }
        // Preserve every historical section, its name, ID and pivot memberships.
        foreach (DB::table('product_sections')->get() as $section) {
            DB::table('product_categories')->insertOrIgnore(['id' => $section->id, 'family' => 'lead-acid', 'name' => $section->name, 'sort_order' => $section->sort_order, 'legacy_section_id' => $section->id, 'description' => $section->description, 'created_at' => $now, 'updated_at' => $now]);
        }
        foreach (['inverter' => ['Offgrid (IP 21)', 'Hybrid (IP 65/66)'], 'lithium-ion' => ['Wall-Mounted Batteries', 'Rack-Mounted Batteries']] as $family => $names) {
            foreach ($names as $order => $name) {
                DB::table('product_categories')->insertOrIgnore(compact('family', 'name') + ['sort_order' => $order, 'created_at' => $now, 'updated_at' => $now]);
            }
        }
        foreach (['lead-acid' => ['Automotive', 'Backup', 'Solar', 'Industrial'], 'lithium-ion' => ['Cube', 'Solar/Backup']] as $family => $names) {
            foreach ($names as $order => $name) {
                DB::table('product_tags')->insertOrIgnore(compact('family', 'name') + ['sort_order' => $order, 'created_at' => $now, 'updated_at' => $now]);
            }
        }
        foreach (DB::table('products')->get() as $product) {
            // Only products actually published before this migration get the exception.
            if ($product->type === 'lead-acid' && $product->status === 'published') {
                DB::table('products')->where('id', $product->id)->update(['legacy_publication_exempt' => true]);
            }
            if ($product->type === 'lead-acid') {
                $memberships = DB::table('product_product_section')->where('product_id', $product->id)->pluck('product_section_id');
                if ($memberships->count() === 1) {
                    $category = DB::table('product_categories')->where('legacy_section_id', $memberships->first())->value('id');
                    DB::table('products')->where('id', $product->id)->update(['primary_category_id' => $category]);
                }
                // No automatic unit, length/depth, warranty or dry-weight reinterpretation.
                DB::table('lead_acid_specifications')->insert(['product_id' => $product->id, 'created_at' => $now, 'updated_at' => $now]);
            }
            foreach (json_decode($product->tags ?? '[]', true) ?: [] as $name) {
                DB::table('product_tags')->insertOrIgnore(['family' => $product->type, 'name' => $name, 'created_at' => $now, 'updated_at' => $now]);
                $tag = DB::table('product_tags')->where('family', $product->type)->where('name', $name)->value('id');
                DB::table('product_tag_assignments')->insertOrIgnore(['product_id' => $product->id, 'product_tag_id' => $tag]);
            }
            foreach (ProductFamily::tryFrom($product->type)?->documentSlots() ?? [] as $slot => $label) {
                DB::table('product_documents')->insertOrIgnore(['product_id' => $product->id, 'slot' => $slot, 'created_at' => $now, 'updated_at' => $now]);
            }
        }
        foreach (['inverter' => 'Inverters', 'lithium-ion' => 'Lithium Ion Batteries'] as $family => $title) {
            DB::table('catalog_banners')->insertOrIgnore(compact('family', 'title') + ['alt_text' => $title, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    public function down(): void
    {
        // Removing required upgraded data is intentionally not an automatic rollback.
        throw new RuntimeException('This catalog migration preserves live data. Restore a reviewed backup instead of dropping the upgraded catalog.');
    }
};
