<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\MedicalRecordAttachment;
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

        // 4. Seed Medical Records with 9 Clinical Sections & Attachments
        $clinicalRecords = [
            [
                'patient_id' => $createdPatients[0]->id,
                'doctor_id' => $doctors[0]->id,
                'chief_complaint' => 'Acute lower lumbar spine pain radiating down right leg after lifting heavy cargo.',
                'pain_level' => 8,
                'medical_history' => 'L4-L5 lumbar strain in 2021. No previous spinal surgeries.',
                'current_medications' => 'Ibuprofen 400mg PRN for inflammation.',
                'allergies' => 'Penicillin (mild skin rash reaction).',
                'physical_examination' => 'Palpation reveals severe paraspinal muscle spasm around L4-S1. Positive Straight Leg Raise test at 45 degrees on right side.',
                'diagnosis' => 'L4-L5 Lumbar Disc Herniation with Right Sciatic Radiculopathy.',
                'treatment_plan' => '3x weekly Spinal Decompression Therapy for 4 weeks. Core stabilization physical rehab.',
                'progress_notes' => 'Patient reports 30% reduction in numbness following initial decompression session.',
                'record_date' => Carbon::now()->subDays(2),
            ],
            [
                'patient_id' => $createdPatients[1]->id,
                'doctor_id' => $doctors[1]->id,
                'chief_complaint' => 'Persistent cervical neck stiffness and daily tension headaches originating at suboccipital region.',
                'pain_level' => 6,
                'medical_history' => 'Sedentary desk job 9+ hours daily. Cervical strain following minor fender bender 2 years ago.',
                'current_medications' => 'Acetaminophen 500mg, Magnesium glycinate.',
                'allergies' => 'No known drug allergies (NKDA).',
                'physical_examination' => 'Forward head posture +3cm. Reduced cervical lateral rotation (Right: 40 deg, Left: 65 deg). Suboccipital muscle hypertonicity.',
                'diagnosis' => 'Cervical Spine Dysfunction & Postural Cervicogenic Headache.',
                'treatment_plan' => 'Cervical spinal manipulation 2x weekly. Ergonomic workplace assessment and postural neck traction.',
                'progress_notes' => 'Headache frequency reduced from daily to 1-2 per week after 2 weeks of care.',
                'record_date' => Carbon::now()->subDays(5),
            ],
        ];

        foreach ($clinicalRecords as $recordData) {
            $record = MedicalRecord::create($recordData);

            // Add sample X-ray attachment record
            MedicalRecordAttachment::create([
                'medical_record_id' => $record->id,
                'file_name' => 'Lumbar_Spine_XRay_AP_Lateral.png',
                'file_path' => 'medical_records/sample_xray.png',
                'file_type' => 'xray',
                'mime_type' => 'image/png',
                'file_size' => 2450000,
            ]);

            MedicalRecordAttachment::create([
                'medical_record_id' => $record->id,
                'file_name' => 'MRI_Radiology_Report.pdf',
                'file_path' => 'medical_records/sample_report.pdf',
                'file_type' => 'pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1200000,
            ]);
        }
    }
}
