<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Premium Cotton Therapy Towels, TENS Electrotherapy Pads
            $table->string('sku')->unique(); // e.g., SUP-TOWL-01, SUP-TENS-02
            $table->enum('category', [
                'Towels & Linen',
                'Electrotherapy Pads',
                'Massage Oils & Lotions',
                'Medical & Orthopedic Supplies',
                'Disinfectants & Hygiene'
            ])->default('Towels & Linen');
            $table->integer('quantity')->default(0); // current stock level
            $table->integer('reorder_threshold')->default(10); // threshold for low-stock alert
            $table->string('unit')->default('units'); // packs, bottles, boxes, rolls, units
            $table->decimal('unit_cost', 8, 2)->default(0.00);
            $table->string('supplier_name')->nullable();
            $table->string('storage_location')->nullable(); // e.g., Cabinet A2, Storage Room B
            $table->timestamp('last_restocked_at')->nullable();
            $table->enum('status', ['in_stock', 'low_stock', 'out_of_stock'])->default('in_stock');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
