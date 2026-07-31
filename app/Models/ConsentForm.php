<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ConsentForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'form_type',
        'title',
        'content',
        'signer_name',
        'signature_data',
        'signature_path',
        'signed_at',
        'ip_address',
        'status',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    protected $appends = [
        'signature_url',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function getSignatureUrlAttribute(): ?string
    {
        if ($this->signature_path) {
            return Storage::url($this->signature_path);
        }

        if ($this->signature_data) {
            return $this->signature_data;
        }

        return null;
    }
}
