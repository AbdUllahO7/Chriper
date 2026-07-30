<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\MedicalRecordAttachment;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\TreatmentSession;
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

        // 4. Seed Medical Records
        $clinicalRecord = MedicalRecord::create([
            'patient_id' => $createdPatients[0]->id,
            'doctor_id' => $doctors[0]->id,
            'chief_complaint' => 'Acute lower lumbar spine pain radiating down right leg.',
            'pain_level' => 8,
            'medical_history' => 'L4-L5 lumbar strain in 2021.',
            'current_medications' => 'Ibuprofen 400mg PRN.',
            'allergies' => 'Penicillin.',
            'physical_examination' => 'Palpation reveals severe paraspinal muscle spasm around L4-S1.',
            'diagnosis' => 'L4-L5 Lumbar Disc Herniation with Right Sciatic Radiculopathy.',
            'treatment_plan' => '3x weekly Spinal Decompression Therapy for 4 weeks.',
            'progress_notes' => 'Patient reports 30% reduction in numbness following decompression.',
            'record_date' => Carbon::now()->subDays(2),
        ]);

        MedicalRecordAttachment::create([
            'medical_record_id' => $clinicalRecord->id,
            'file_name' => 'Lumbar_Spine_XRay_AP_Lateral.png',
            'file_path' => 'medical_records/sample_xray.png',
            'file_type' => 'xray',
            'mime_type' => 'image/png',
            'file_size' => 2450000,
        ]);

        // 5. Seed Treatment Sessions
        $sessions = [
            [
                'patient_id' => $createdPatients[0]->id,
                'doctor_id' => $doctors[0]->id,
                'session_date' => Carbon::now()->subDays(1)->setHour(10)->setMinute(30),
                'treatment_type' => 'Lumbar Decompression & Pelvic Alignment',
                'adjustment_areas' => ['Lumbar L4-L5', 'Lumbar L5-S1', 'Pelvic / SI Joint'],
                'notes' => 'Performed 15-minute lumbar mechanical decompression traction. Applied high-velocity low-amplitude (HVLA) thrust to right sacroiliac joint.',
                'recommendations' => "1. Apply ice pack to lower lumbar region for 15 minutes twice daily.\n2. Perform gentle cat-cow spinal flexions 10 reps in morning.\n3. Avoid heavy lifting (>15 lbs) for 48 hours.",
            ],
            [
                'patient_id' => $createdPatients[1]->id,
                'doctor_id' => $doctors[1]->id,
                'session_date' => Carbon::now()->subDays(3)->setHour(14)->setMinute(00),
                'treatment_type' => 'Cervical Spine Mobilization & Myofascial Release',
                'adjustment_areas' => ['Cervical C1-C2', 'Cervical C5-C7', 'Thoracic T1-T4'],
                'notes' => 'Suboccipital myofascial release performed for 10 minutes. Cervical spine rotation alignment applied bilaterally.',
                'recommendations' => "1. Perform chin tuck posture exercises 3 sets of 10 daily.\n2. Maintain ergonomic monitor height at eye level at work desk.\n3. Hydrate with 2.5L water daily to support tissue recovery.",
            ],
        ];

        foreach ($sessions as $sData) {
            TreatmentSession::create($sData);
        }
    }
}
