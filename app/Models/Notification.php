<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'patient_id',
        'type',
        'title',
        'message',
        'scheduled_at',
        'read_at',
        'action_url',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    protected $appends = [
        'is_read',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }
}
