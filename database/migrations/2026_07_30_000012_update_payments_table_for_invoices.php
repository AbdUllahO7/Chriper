<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('invoice_id')->nullable()->after('patient_id')->constrained('invoices')->nullOnDelete();
            $table->string('payment_method')->default('card')->after('amount'); // cash, card, insurance
            $table->string('reference_number')->nullable()->after('payment_method');
            $table->text('notes')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropColumn(['invoice_id', 'payment_method', 'reference_number', 'notes']);
        });
    }
};
