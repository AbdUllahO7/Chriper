<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsuranceClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'insurance_policy_id',
        'invoice_id',
        'claim_number',
        'claim_date',
        'billed_amount',
        'allowed_amount',
        'paid_amount',
        'patient_responsibility',
        'claim_status',
        'denial_reason',
        'notes',
    ];

    protected $casts = [
        'claim_date' => 'date',
        'billed_amount' => 'float',
        'allowed_amount' => 'float',
        'paid_amount' => 'float',
        'patient_responsibility' => 'float',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function insurancePolicy(): BelongsTo
    {
        return $this->belongsTo(InsurancePolicy::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
