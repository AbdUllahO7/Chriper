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
        Schema::create('clinic_branches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_main_branch')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add clinic_branch_id foreign keys to core entities
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('clinic_branch_id')->nullable()->after('role')->constrained('clinic_branches')->onDelete('set null');
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->foreignId('clinic_branch_id')->nullable()->after('user_id')->constrained('clinic_branches')->onDelete('set null');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('clinic_branch_id')->nullable()->after('chiropractor_id')->constrained('clinic_branches')->onDelete('set null');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->foreignId('clinic_branch_id')->nullable()->after('referral_notes')->constrained('clinic_branches')->onDelete('set null');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('clinic_branch_id')->nullable()->after('doctor_id')->constrained('clinic_branches')->onDelete('set null');
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->foreignId('clinic_branch_id')->nullable()->after('category')->constrained('clinic_branches')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', fn(Blueprint $table) => $table->dropConstrainedForeignId('clinic_branch_id'));
        Schema::table('invoices', fn(Blueprint $table) => $table->dropConstrainedForeignId('clinic_branch_id'));
        Schema::table('patients', fn(Blueprint $table) => $table->dropConstrainedForeignId('clinic_branch_id'));
        Schema::table('appointments', fn(Blueprint $table) => $table->dropConstrainedForeignId('clinic_branch_id'));
        Schema::table('doctors', fn(Blueprint $table) => $table->dropConstrainedForeignId('clinic_branch_id'));
        Schema::table('users', fn(Blueprint $table) => $table->dropConstrainedForeignId('clinic_branch_id'));

        Schema::dropIfExists('clinic_branches');
    }
};
