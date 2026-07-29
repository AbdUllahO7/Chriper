<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chiropractor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('appointment_date');
            $table->enum('status', ['completed', 'scheduled', 'cancelled'])->default('scheduled');
            $table->string('service_type')->default('Spinal Adjustment');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
