<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_number',
        'document_type',
        'patient_id',
        'doctor_id',
        'title',
        'content_json',
        'issued_at',
    ];

    protected $casts = [
        'content_json' => 'array',
        'issued_at' => 'date',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
