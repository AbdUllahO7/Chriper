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
        Schema::table('patients', function (Blueprint $table) {
            $table->enum('referral_source', [
                'doctor',
                'friend',
                'social_media',
                'google_search',
                'walk_in',
                'advertisement',
                'other'
            ])->default('walk_in')->after('notes');
            $table->string('referred_by_name')->nullable()->after('referral_source'); // e.g. Dr. Sarah Jenkins, John Doe, Instagram @Clinic
            $table->foreignId('referred_by_patient_id')->nullable()->after('referred_by_name')->constrained('patients')->onDelete('set null');
            $table->text('referral_notes')->nullable()->after('referred_by_patient_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['referred_by_patient_id']);
            $table->dropColumn([
                'referral_source',
                'referred_by_name',
                'referred_by_patient_id',
                'referral_notes',
            ]);
        });
    }
};
