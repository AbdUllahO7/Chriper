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
        // 1. Seed Staff Users (Roles)
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

        // 2. Seed Doctors (Chiropractors)
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
                'room_number' => 'Suite 301 (Chief Suite)',
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
            [
                'user_id' => null,
                'name' => 'Dr. Samantha Hayes',
                'specialty' => 'Cervical Spine & Headache Relief',
                'phone' => '555-0912',
                'email' => 'shayes@clinic.com',
                'working_hours' => '12:00 PM - 08:00 PM',
                'room_number' => 'Suite 115',
                'is_available' => false,
                'availability_status' => 'off_duty',
            ],
        ];

        foreach ($sampleDoctors as $doc) {
            Doctor::updateOrCreate(['email' => $doc['email']], $doc);
        }

        // 3. Seed Realistic Patients
        $samplePatients = [
            [
                'first_name' => 'Robert',
                'last_name' => 'Martinez',
                'date_of_birth' => '1985-04-12',
                'gender' => 'male',
                'email' => 'robert.m@example.com',
                'phone' => '555-0192',
                'address' => '742 Evergreen Terrace, Springfield',
                'emergency_contact' => 'Maria Martinez (Spouse) - 555-0193',
                'insurance' => 'BlueCross BlueShield #BC-9482',
                'notes' => 'Chronic lower back pain from heavy lifting. Responding well to lumbar decompression therapy.',
                'status' => 'active',
                'month' => 1,
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Watson',
                'date_of_birth' => '1992-08-24',
                'gender' => 'female',
                'email' => 'emily.w@example.com',
                'phone' => '555-0184',
                'address' => '1048 Ocean Avenue, Santa Monica',
                'emergency_contact' => 'David Watson (Brother) - 555-0185',
                'insurance' => 'Aetna Healthcare #AE-7721',
                'notes' => 'Cervical spine stiffness and tension headaches. Weekly chiropractic alignment scheduled.',
                'status' => 'active',
                'month' => 1,
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Chang',
                'date_of_birth' => '1978-11-03',
                'gender' => 'male',
                'email' => 'mchang@example.com',
                'phone' => '555-0211',
                'address' => '350 Fifth Avenue, New York',
                'emergency_contact' => 'Linda Chang (Wife) - 555-0212',
                'insurance' => 'UnitedHealth #UH-3391',
                'notes' => 'Sciatica symptoms down right leg. Postural rehabilitation exercise plan prescribed.',
                'status' => 'active',
                'month' => 2,
            ],
        ];

        $createdPatients = [];
        foreach ($samplePatients as $pData) {
            $createdDate = Carbon::create(now()->year, $pData['month'], rand(1, 25));
            $createdPatients[] = Patient::updateOrCreate(
                ['email' => $pData['email']],
                [
                    'first_name' => $pData['first_name'],
                    'last_name' => $pData['last_name'],
                    'date_of_birth' => $pData['date_of_birth'],
                    'gender' => $pData['gender'],
                    'phone' => $pData['phone'],
                    'address' => $pData['address'],
                    'emergency_contact' => $pData['emergency_contact'],
                    'insurance' => $pData['insurance'],
                    'notes' => $pData['notes'],
                    'status' => $pData['status'],
                    'created_at' => $createdDate,
                    'updated_at' => $createdDate,
                ]
            );
        }

        // Additional patients
        $genders = ['male', 'female', 'other'];
        for ($i = 1; $i <= 15; $i++) {
            $month = rand(1, 7);
            $cDate = Carbon::create(now()->year, $month, rand(1, 28));
            $createdPatients[] = Patient::create([
                'first_name' => "Patient{$i}",
                'last_name' => "Sample",
                'date_of_birth' => "199" . rand(0, 9) . "-0" . rand(1, 9) . "-15",
                'gender' => $genders[$i % 3],
                'email' => "patient{$i}@clinic.com",
                'phone' => "555-100{$i}",
                'address' => "10{$i} Main Street, Suite " . ($i * 10),
                'emergency_contact' => "Emergency Contact {$i} - 555-900{$i}",
                'insurance' => "Health Plan #" . (1000 + $i),
                'notes' => "Regular maintenance patient care record {$i}.",
                'status' => rand(1, 10) > 2 ? 'active' : 'inactive',
                'created_at' => $cDate,
                'updated_at' => $cDate,
            ]);
        }

        // Seed Appointments
        $services = ['Spinal Adjustment', 'Initial Consultation', 'Physical Therapy', 'Postural Rehab', 'Decompression Therapy'];

        foreach (array_slice($createdPatients, 0, 6) as $index => $patient) {
            $appDate = Carbon::today()->setHour(8 + ($index * 2));
            $appointment = Appointment::create([
                'patient_id' => $patient->id,
                'chiropractor_id' => $chiropractor->id,
                'appointment_date' => $appDate,
                'status' => $index < 4 ? 'completed' : 'scheduled',
                'service_type' => $services[$index % count($services)],
            ]);

            Payment::create([
                'patient_id' => $patient->id,
                'appointment_id' => $appointment->id,
                'amount' => rand(120, 250),
                'status' => $index < 4 ? 'paid' : 'pending',
                'payment_date' => $index < 4 ? $appDate : null,
                'created_at' => $appDate,
            ]);
        }
    }
}
