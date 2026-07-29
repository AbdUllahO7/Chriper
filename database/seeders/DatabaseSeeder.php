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
        // 1. Seed Users (Roles)
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

        // 2. Seed Patients across months (Jan to Jul)
        $samplePatients = [
            ['first_name' => 'Robert', 'last_name' => 'Martinez', 'email' => 'robert.m@example.com', 'phone' => '555-0192', 'status' => 'active', 'month' => 1],
            ['first_name' => 'Emily', 'last_name' => 'Watson', 'email' => 'emily.w@example.com', 'phone' => '555-0184', 'status' => 'active', 'month' => 1],
            ['first_name' => 'Michael', 'last_name' => 'Chang', 'email' => 'mchang@example.com', 'phone' => '555-0211', 'status' => 'active', 'month' => 2],
            ['first_name' => 'Jessica', 'last_name' => 'Alba', 'email' => 'jessica.a@example.com', 'phone' => '555-0329', 'status' => 'active', 'month' => 2],
            ['first_name' => 'David', 'last_name' => 'Beckham', 'email' => 'david.b@example.com', 'phone' => '555-0482', 'status' => 'active', 'month' => 3],
            ['first_name' => 'Sophia', 'last_name' => 'Loren', 'email' => 'sophia.l@example.com', 'phone' => '555-0519', 'status' => 'active', 'month' => 3],
            ['first_name' => 'James', 'last_name' => 'Bond', 'email' => 'jbond@example.com', 'phone' => '555-0007', 'status' => 'active', 'month' => 4],
            ['first_name' => 'Olivia', 'last_name' => 'Wilde', 'email' => 'olivia.w@example.com', 'phone' => '555-0671', 'status' => 'active', 'month' => 5],
            ['first_name' => 'Daniel', 'last_name' => 'Craig', 'email' => 'dcraig@example.com', 'phone' => '555-0728', 'status' => 'active', 'month' => 6],
            ['first_name' => 'Emma', 'last_name' => 'Stone', 'email' => 'estone@example.com', 'phone' => '555-0812', 'status' => 'active', 'month' => 7],
            ['first_name' => 'Chris', 'last_name' => 'Hemsworth', 'email' => 'chems@example.com', 'phone' => '555-0921', 'status' => 'active', 'month' => 7],
            ['first_name' => 'Scarlett', 'last_name' => 'Johansson', 'email' => 'scarlett@example.com', 'phone' => '555-1049', 'status' => 'active', 'month' => 7],
        ];

        $createdPatients = [];
        foreach ($samplePatients as $pData) {
            $createdDate = Carbon::create(now()->year, $pData['month'], rand(1, 25));
            $createdPatients[] = Patient::updateOrCreate(
                ['email' => $pData['email']],
                [
                    'first_name' => $pData['first_name'],
                    'last_name' => $pData['last_name'],
                    'phone' => $pData['phone'],
                    'status' => $pData['status'],
                    'created_at' => $createdDate,
                    'updated_at' => $createdDate,
                ]
            );
        }

        // Add additional random active patients to reach realistic total (e.g. 45 patients)
        for ($i = 1; $i <= 33; $i++) {
            $month = rand(1, 7);
            $cDate = Carbon::create(now()->year, $month, rand(1, 28));
            $createdPatients[] = Patient::create([
                'first_name' => "Patient{$i}",
                'last_name' => "Sample",
                'email' => "patient{$i}@clinic.com",
                'phone' => "555-100{$i}",
                'status' => rand(1, 10) > 2 ? 'active' : 'inactive',
                'created_at' => $cDate,
                'updated_at' => $cDate,
            ]);
        }

        // 3. Seed Appointments for today, this week, and historical
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

            // Seed Payments
            Payment::create([
                'patient_id' => $patient->id,
                'appointment_id' => $appointment->id,
                'amount' => rand(120, 250),
                'status' => $index < 4 ? 'paid' : 'pending',
                'payment_date' => $index < 4 ? $appDate : null,
                'created_at' => $appDate,
            ]);
        }

        // Seed Appointments for current week (Mon - Sun)
        $startOfWeek = Carbon::now()->startOfWeek();
        for ($day = 0; $day < 7; $day++) {
            $dayDate = (clone $startOfWeek)->addDays($day);
            $appCount = rand(8, 16);
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

        // Seed Historical Monthly Revenue Payments (Jan - Jul)
        for ($m = 1; $m <= 7; $m++) {
            $monthDate = Carbon::create(now()->year, $m, 15);
            $numPayments = rand(40, 70);
            for ($p = 0; $p < $numPayments; $p++) {
                $pDate = (clone $monthDate)->setDay(rand(1, 28));
                Payment::create([
                    'patient_id' => $createdPatients[array_rand($createdPatients)]->id,
                    'amount' => rand(150, 350),
                    'status' => 'paid',
                    'payment_date' => $pDate,
                    'created_at' => $pDate,
                ]);
            }
        }
    }
}
