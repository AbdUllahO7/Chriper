<?php

namespace Database\Seeders;

use App\Models\Appointment;
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

        // 2. Seed Realistic Patients with all 10 fields
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
            [
                'first_name' => 'Jessica',
                'last_name' => 'Alba',
                'date_of_birth' => '1988-01-15',
                'gender' => 'female',
                'email' => 'jessica.a@example.com',
                'phone' => '555-0329',
                'address' => '120 Sunset Boulevard, Los Angeles',
                'emergency_contact' => 'Cash Warren - 555-0330',
                'insurance' => 'Cigna Health #CG-8812',
                'notes' => 'Thoracic spine tightness. Responds well to heat therapy prior to spinal manipulation.',
                'status' => 'active',
                'month' => 2,
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Beckham',
                'date_of_birth' => '1975-05-02',
                'gender' => 'male',
                'email' => 'david.b@example.com',
                'phone' => '555-0482',
                'address' => '450 Victoria Lane, Miami',
                'emergency_contact' => 'Victoria Beckham - 555-0483',
                'insurance' => 'Kaiser Permanente #KP-1092',
                'notes' => 'Lumbar strain following athletic training. Weekly spinal adjustment routine.',
                'status' => 'active',
                'month' => 3,
            ],
            [
                'first_name' => 'Sophia',
                'last_name' => 'Loren',
                'date_of_birth' => '1995-09-30',
                'gender' => 'female',
                'email' => 'sophia.l@example.com',
                'phone' => '555-0519',
                'address' => '880 Grand Avenue, Chicago',
                'emergency_contact' => 'Marco Loren - 555-0520',
                'insurance' => 'Humana Care #HM-4401',
                'notes' => 'Neck strain and upper back discomfort from desk work.',
                'status' => 'active',
                'month' => 3,
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

        // Add additional sample active/inactive patients to reach realistic total for pagination
        $genders = ['male', 'female', 'other'];
        for ($i = 1; $i <= 20; $i++) {
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

        // 3. Seed Appointments
        $services = ['Spinal Adjustment', 'Initial Consultation', 'Physical Therapy', 'Postural Rehab', 'Decompression Therapy'];

        // Today's appointments
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

        // Current week appointments
        $startOfWeek = Carbon::now()->startOfWeek();
        for ($day = 0; $day < 7; $day++) {
            $dayDate = (clone $startOfWeek)->addDays($day);
            $appCount = rand(4, 8);
            for ($k = 0; $k < $appCount; $k++) {
                $randomPatient = $createdPatients[array_rand($createdPatients)];
                $status = ($dayDate->isPast()) ? 'completed' : 'scheduled';
                $appTime = (clone $dayDate)->setHour(8 + ($k % 9));

                $appt = Appointment::create([
                    'patient_id' => $randomPatient->id,
                    'chiropractor_id' => $chiropractor->id,
                    'appointment_date' => $appTime,
                    'status' => $status,
                    'service_type' => $services[array_rand($services)],
                    'created_at' => $appTime,
                ]);

                Payment::create([
                    'patient_id' => $randomPatient->id,
                    'appointment_id' => $appt->id,
                    'amount' => rand(100, 300),
                    'status' => ($status === 'completed') ? 'paid' : 'pending',
                    'payment_date' => ($status === 'completed') ? $appTime : null,
                    'created_at' => $appTime,
                ]);
            }
        }
    }
}
