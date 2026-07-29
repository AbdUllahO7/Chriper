<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'chiropractor_id',
        'appointment_date',
        'status',
        'service_type',
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function chiropractor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chiropractor_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
