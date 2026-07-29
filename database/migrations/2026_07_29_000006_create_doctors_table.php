<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('specialty')->default('Chiropractic Care & Rehabilitation');
            $table->string('phone');
            $table->string('email')->unique();
            $table->string('working_hours')->default('08:00 AM - 05:00 PM');
            $table->string('room_number')->default('Room 101');
            $table->boolean('is_available')->default(true);
            $table->enum('availability_status', ['available', 'busy', 'off_duty'])->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
