<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'email',
        'phone',
        'address',
        'emergency_contact',
        'insurance',
        'notes',
        'status',
        'profile_photo_path',
    ];

    protected $appends = [
        'full_name',
        'profile_photo_url',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function treatmentSessions(): HasMany
    {
        return $this->hasMany(TreatmentSession::class);
    }

    public function treatmentPlans(): HasMany
    {
        return $this->hasMany(TreatmentPlan::class);
    }

    public function consentForms(): HasMany
    {
        return $this->hasMany(ConsentForm::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function insurancePolicies(): HasMany
    {
        return $this->hasMany(InsurancePolicy::class);
    }

    public function insuranceClaims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getProfilePhotoUrlAttribute(): string
    {
        if ($this->profile_photo_path) {
            return Storage::url($this->profile_photo_path);
        }

        $name = urlencode($this->full_name);
        return "https://ui-avatars.com/api/?name={$name}&background=8b5cf6&color=fff";
    }
}
