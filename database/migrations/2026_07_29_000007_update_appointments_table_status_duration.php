<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('doctor_id')->nullable()->after('chiropractor_id')->constrained('doctors')->nullOnDelete();
            $table->integer('duration')->default(30)->after('appointment_date'); // Duration in minutes
            $table->text('notes')->nullable()->after('service_type');
        });

        // Re-define status enum to support all 6 states
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('status')->default('scheduled')->change();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
            $table->dropColumn(['doctor_id', 'duration', 'notes']);
        });
    }
};
