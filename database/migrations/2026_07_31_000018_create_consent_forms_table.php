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
        Schema::create('consent_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->enum('form_type', ['initial_consent', 'privacy_policy', 'treatment_consent', 'custom'])->default('initial_consent');
            $table->string('title');
            $table->longText('content');
            $table->string('signer_name')->nullable();
            $table->mediumText('signature_data')->nullable(); // Base64 data URL png
            $table->string('signature_path')->nullable(); // Stored PNG file path
            $table->dateTime('signed_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->enum('status', ['pending', 'signed', 'declined'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consent_forms');
    }
};
