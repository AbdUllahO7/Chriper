<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'chief_complaint',
        'pain_level',
        'medical_history',
        'current_medications',
        'allergies',
        'physical_examination',
        'diagnosis',
        'treatment_plan',
        'progress_notes',
        'record_date',
    ];

    protected $casts = [
        'record_date' => 'datetime',
        'pain_level' => 'integer',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MedicalRecordAttachment::class);
    }
}
