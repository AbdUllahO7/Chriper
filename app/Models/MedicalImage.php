<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MedicalImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'image_type',
        'body_region',
        'title',
        'scan_date',
        'file_path',
        'file_size',
        'notes',
    ];

    protected $casts = [
        'scan_date' => 'date',
        'file_size' => 'integer',
    ];

    protected $appends = [
        'file_url',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function getFileUrlAttribute(): string
    {
        if ($this->file_path && Storage::disk('public')->exists($this->file_path)) {
            return Storage::url($this->file_path);
        }

        // Sample fallback high-res medical X-Ray SVG illustration
        return $this->file_path ? Storage::url($this->file_path) : 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop';
    }
}
