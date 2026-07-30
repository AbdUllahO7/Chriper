<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ClinicSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_name',
        'logo_path',
        'phone',
        'email',
        'address',
        'working_hours',
        'currency_code',
        'currency_symbol',
        'tax_rate',
        'services',
    ];

    protected $casts = [
        'services' => 'array',
        'tax_rate' => 'float',
    ];

    protected $appends = [
        'logo_url',
    ];

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'clinic_name' => 'Chirper Spine Clinic',
            'phone' => '(555) 019-2830',
            'email' => 'contact@chirperspine.com',
            'address' => '100 Health Care Boulevard, Suite 400',
            'working_hours' => 'Mon - Fri: 08:00 AM - 06:00 PM, Sat: 09:00 AM - 02:00 PM',
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'tax_rate' => 0.00,
            'services' => [
                ['id' => 1, 'name' => 'Spinal Decompression & Alignment', 'category' => 'Decompression', 'price' => 150.00, 'duration_minutes' => 30],
                ['id' => 2, 'name' => 'Initial Chiropractic Consultation & Exam', 'category' => 'Consultation', 'price' => 120.00, 'duration_minutes' => 45],
                ['id' => 3, 'name' => 'Cervical Spine Mobilization', 'category' => 'Mobilization', 'price' => 100.00, 'duration_minutes' => 30],
                ['id' => 4, 'name' => 'Postural Rehabilitation & Sciatica Therapy', 'category' => 'Rehab', 'price' => 90.00, 'duration_minutes' => 30],
            ],
        ]);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path) {
            return Storage::url($this->logo_path);
        }

        return null;
    }
}
