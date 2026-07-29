<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isReceptionist(): bool
    {
        return $this->role === 'receptionist';
    }

    public function isChiropractor(): bool
    {
        return $this->role === 'chiropractor';
    }

    /**
     * Get permissions array based on role.
     *
     * @return array<string>
     */
    public function getPermissionsAttribute(): array
    {
        return match ($this->role) {
            'admin' => [
                'users.manage',
                'users.create',
                'users.roles',
                'patients.view',
                'patients.manage',
                'treatments.view',
                'treatments.manage',
                'reports.view',
            ],
            'chiropractor' => [
                'patients.view',
                'treatments.view',
                'treatments.manage',
                'clinical_notes.write',
            ],
            'receptionist' => [
                'patients.view',
                'patients.manage',
                'appointments.schedule',
                'appointments.cancel',
            ],
            default => ['patients.view'],
        };
    }
}
