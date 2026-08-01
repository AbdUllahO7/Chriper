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
        // Patient Insurance Policies Table
        Schema::create('insurance_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->string('insurance_company'); // e.g. BlueCross BlueShield, Aetna, UnitedHealth
            $table->string('policy_number');
            $table->string('group_number')->nullable();
            $table->decimal('coverage_percentage', 5, 2)->default(80.00); // 80% coverage
            $table->decimal('copay_amount', 8, 2)->default(25.00); // $25 copay per visit
            $table->decimal('deductible_amount', 10, 2)->default(500.00); // $500 annual deductible
            $table->decimal('deductible_met', 10, 2)->default(0.00); // $ Amount met so far
            $table->integer('max_visits_per_year')->default(20); // 20 visits allowed per year
            $table->integer('used_visits')->default(0); // Visits used so far
            $table->date('effective_date')->nullable();
            $table->date('expiration_date')->nullable();
            $table->enum('status', ['active', 'expired', 'pending_verification'])->default('active');
            $table->timestamps();
        });

        // Insurance Claims Table
        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('insurance_policy_id')->constrained('insurance_policies')->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->string('claim_number')->unique(); // e.g. CLM-89102
            $table->date('claim_date');
            $table->decimal('billed_amount', 10, 2);
            $table->decimal('allowed_amount', 10, 2)->nullable();
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->decimal('patient_responsibility', 10, 2)->default(0.00);
            $table->enum('claim_status', ['draft', 'submitted', 'in_review', 'approved', 'partially_paid', 'denied'])->default('submitted');
            $table->text('denial_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
        Schema::dropIfExists('insurance_policies');
    }
};
