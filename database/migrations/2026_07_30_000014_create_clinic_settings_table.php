<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_settings', function (Blueprint $table) {
            $table->id();
            $table->string('clinic_name')->default('Chirper Spine Clinic');
            $table->string('logo_path')->nullable();
            $table->string('phone')->default('(555) 019-2830');
            $table->string('email')->default('contact@chirperspine.com');
            $table->string('address')->default('100 Health Care Boulevard, Suite 400');
            $table->string('working_hours')->default('Mon - Fri: 08:00 AM - 06:00 PM, Sat: 09:00 AM - 02:00 PM');
            $table->string('currency_code')->default('USD');
            $table->string('currency_symbol')->default('$');
            $table->decimal('tax_rate', 5, 2)->default(0.00);
            $table->json('services')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_settings');
    }
};
