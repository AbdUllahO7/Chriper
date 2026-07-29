<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('last_name');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('date_of_birth');
            $table->text('address')->nullable()->after('phone');
            $table->string('emergency_contact')->nullable()->after('address');
            $table->string('insurance')->nullable()->after('emergency_contact');
            $table->text('notes')->nullable()->after('insurance');
            $table->string('profile_photo_path')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'address',
                'emergency_contact',
                'insurance',
                'notes',
                'profile_photo_path',
            ]);
        });
    }
};
