<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InsurancePolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'insurance_company',
        'policy_number',
        'group_number',
        'coverage_percentage',
        'copay_amount',
        'deductible_amount',
        'deductible_met',
        'max_visits_per_year',
        'used_visits',
        'effective_date',
        'expiration_date',
        'status',
    ];

    protected $casts = [
        'coverage_percentage' => 'float',
        'copay_amount' => 'float',
        'deductible_amount' => 'float',
        'deductible_met' => 'float',
        'max_visits_per_year' => 'integer',
        'used_visits' => 'integer',
        'effective_date' => 'date',
        'expiration_date' => 'date',
    ];

    protected $appends = [
        'remaining_visits',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class);
    }

    public function getRemainingVisitsAttribute(): int
    {
        return max(0, $this->max_visits_per_year - $this->used_visits);
    }
}
