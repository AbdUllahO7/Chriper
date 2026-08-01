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
        Schema::create('medical_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained('doctors')->onDelete('set null');
            $table->enum('image_type', ['xray', 'mri', 'ct_scan'])->default('xray');
            $table->string('body_region')->default('Cervical Spine'); // Cervical, Lumbar, Thoracic, Full Spine, Pelvis
            $table->string('title');
            $table->date('scan_date');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size')->default(0); // in bytes
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_images');
    }
};
