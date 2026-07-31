<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TreatmentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'title',
        'description',
        'total_sessions',
        'completed_sessions',
        'frequency_per_week',
        'start_date',
        'target_end_date',
        'status',
        'weeks_breakdown',
    ];

    protected $casts = [
        'start_date' => 'date',
        'target_end_date' => 'date',
        'total_sessions' => 'integer',
        'completed_sessions' => 'integer',
        'frequency_per_week' => 'integer',
        'weeks_breakdown' => 'array',
    ];

    protected $appends = [
        'completion_percentage',
        'remaining_sessions',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function treatmentSessions(): HasMany
    {
        return $this->hasMany(TreatmentSession::class);
    }

    public function getCompletionPercentageAttribute(): int
    {
        if ($this->total_sessions <= 0) {
            return 0;
        }

        return (int) min(100, round(($this->completed_sessions / $this->total_sessions) * 100));
    }

    public function getRemainingSessionsAttribute(): int
    {
        return (int) max(0, $this->total_sessions - $this->completed_sessions);
    }
}
