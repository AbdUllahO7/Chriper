<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Staff Users
        $admin = User::updateOrCreate(
            ['email' => 'admin@chirper.com'],
            [
                'name' => 'Dr. Alexander Vance (Admin)',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $receptionist = User::updateOrCreate(
            ['email' => 'receptionist@chirper.com'],
            [
                'name' => 'Sarah Connor (Receptionist)',
                'password' => Hash::make('password'),
                'role' => 'receptionist',
                'email_verified_at' => now(),
            ]
        );

        $chiropractor = User::updateOrCreate(
            ['email' => 'chiropractor@chirper.com'],
            [
                'name' => 'Dr. Marcus Wright (Chiropractor)',
                'password' => Hash::make('password'),
                'role' => 'chiropractor',
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed Doctors
        $sampleDoctors = [
            [
                'user_id' => $chiropractor->id,
                'name' => 'Dr. Marcus Wright',
                'specialty' => 'Spinal Decompression & Postural Rehab',
                'phone' => '555-0199',
                'email' => 'chiropractor@chirper.com',
                'working_hours' => '08:00 AM - 04:00 PM',
                'room_number' => 'Suite 204',
                'is_available' => true,
                'availability_status' => 'available',
            ],
            [
                'user_id' => $admin->id,
                'name' => 'Dr. Alexander Vance',
                'specialty' => 'Orthopedic & Pediatric Chiropractic',
                'phone' => '555-0100',
                'email' => 'admin@chirper.com',
                'working_hours' => '09:00 AM - 05:00 PM',
                'room_number' => 'Suite 301',
                'is_available' => true,
                'availability_status' => 'available',
            ],
            [
                'user_id' => null,
                'name' => 'Dr. Elena Rostova',
                'specialty' => 'Sports Injury & Neuromuscular Therapy',
                'phone' => '555-0492',
                'email' => 'elena.rostova@clinic.com',
                'working_hours' => '10:00 AM - 06:00 PM',
                'room_number' => 'Suite 108',
                'is_available' => false,
                'availability_status' => 'busy',
            ],
            [
                'user_id' => null,
                'name' => 'Dr. Jonathan Reed',
                'specialty' => 'Vertebral Alignment & Biomechanics',
                'phone' => '555-0781',
                'email' => 'jreed@clinic.com',
                'working_hours' => '07:30 AM - 03:30 PM',
                'room_number' => 'Suite 212',
                'is_available' => true,
                'availability_status' => 'available',
            ],
        ];

        $doctors = [];
        foreach ($sampleDoctors as $doc) {
            $doctors[] = Doctor::updateOrCreate(['email' => $doc['email']], $doc);
        }

        // 3. Seed Patients
        $samplePatients = [
            ['first_name' => 'Robert', 'last_name' => 'Martinez', 'email' => 'robert.m@example.com', 'phone' => '555-0192', 'gender' => 'male', 'status' => 'active'],
            ['first_name' => 'Emily', 'last_name' => 'Watson', 'email' => 'emily.w@example.com', 'phone' => '555-0184', 'gender' => 'female', 'status' => 'active'],
            ['first_name' => 'Michael', 'last_name' => 'Chang', 'email' => 'mchang@example.com', 'phone' => '555-0211', 'gender' => 'male', 'status' => 'active'],
            ['first_name' => 'Jessica', 'last_name' => 'Alba', 'email' => 'jessica.a@example.com', 'phone' => '555-0329', 'gender' => 'female', 'status' => 'active'],
            ['first_name' => 'David', 'last_name' => 'Beckham', 'email' => 'david.b@example.com', 'phone' => '555-0482', 'gender' => 'male', 'status' => 'active'],
            ['first_name' => 'Sophia', 'last_name' => 'Loren', 'email' => 'sophia.l@example.com', 'phone' => '555-0519', 'gender' => 'female', 'status' => 'active'],
        ];

        $createdPatients = [];
        foreach ($samplePatients as $pData) {
            $createdPatients[] = Patient::updateOrCreate(
                ['email' => $pData['email']],
                array_merge($pData, [
                    'date_of_birth' => '1988-06-15',
                    'address' => '100 Clinic Way, Suite 10',
                    'emergency_contact' => 'Emergency Contact - 555-9999',
                    'insurance' => 'BlueCross BlueShield #BC-9921',
                    'notes' => 'Chiropractic treatment plan active.',
                ])
            );
        }

        // 4. Seed Appointments across the current week with all 6 statuses
        $statuses = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];
        $services = ['Spinal Adjustment', 'Lumbar Decompression', 'Cervical Alignment', 'Physical Therapy', 'Postural Rehabilitation'];
        $durations = [15, 30, 45, 60];

        $startOfWeek = Carbon::now()->startOfWeek();

        // Seed 25 appointments across Mon - Sun
        for ($day = 0; $day < 7; $day++) {
            $currentDay = (clone $startOfWeek)->addDays($day);
            $apptsPerDay = rand(3, 5);

            for ($slot = 0; $slot < $apptsPerDay; $slot++) {
                $pIndex = rand(0, count($createdPatients) - 1);
                $dIndex = rand(0, count($doctors) - 1);
                $patient = $createdPatients[$pIndex];
                $doctor = $doctors[$dIndex];

                $hour = 8 + ($slot * 2);
                $apptTime = (clone $currentDay)->setHour($hour)->setMinute(0);

                // Assign status logically based on past/present/future
                if ($currentDay->isToday()) {
                    $status = $slot === 0 ? 'completed' : ($slot === 1 ? 'in_progress' : ($slot === 2 ? 'checked_in' : 'scheduled'));
                } elseif ($currentDay->isPast()) {
                    $status = rand(1, 10) > 3 ? 'completed' : ($slot % 2 === 0 ? 'cancelled' : 'no_show');
                } else {
                    $status = 'scheduled';
                }

                $duration = $durations[rand(0, count($durations) - 1)];

                $appt = Appointment::create([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'chiropractor_id' => $doctor->user_id ?? $chiropractor->id,
                    'appointment_date' => $apptTime,
                    'duration' => $duration,
                    'status' => $status,
                    'service_type' => $services[rand(0, count($services) - 1)],
                    'notes' => "Patient session for {$patient->first_name} with {$doctor->name}.",
                    'created_at' => $apptTime,
                ]);

                Payment::create([
                    'patient_id' => $patient->id,
                    'appointment_id' => $appt->id,
                    'amount' => rand(120, 250),
                    'status' => $status === 'completed' ? 'paid' : 'pending',
                    'payment_date' => $status === 'completed' ? $apptTime : null,
                    'created_at' => $apptTime,
                ]);
            }
        }
    }
}
