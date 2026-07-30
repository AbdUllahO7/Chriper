<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\MedicalRecord;
use App\Models\MedicalRecordAttachment;
use App\Models\Notification;
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

        // 4. Seed Medical Record & Treatment Session
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

        TreatmentSession::create([
            'patient_id' => $createdPatients[0]->id,
            'doctor_id' => $doctors[0]->id,
            'session_date' => Carbon::now()->subDays(1)->setHour(10)->setMinute(30),
            'treatment_type' => 'Lumbar Decompression & Pelvic Alignment',
            'adjustment_areas' => ['Lumbar L4-L5', 'Lumbar L5-S1', 'Pelvic / SI Joint'],
            'notes' => '15-minute lumbar mechanical decompression. Sacroiliac joint adjustment.',
            'recommendations' => 'Apply ice pack 15 mins. Cat-cow stretches.',
        ]);

        // 5. Seed Invoices & Payments
        $inv1 = Invoice::create([
            'invoice_number' => 'INV-2026-001',
            'patient_id' => $createdPatients[0]->id,
            'doctor_id' => $doctors[0]->id,
            'issue_date' => Carbon::now()->subDays(5),
            'due_date' => Carbon::now()->addDays(25),
            'subtotal' => 250.00,
            'tax' => 0.00,
            'total_amount' => 250.00,
            'amount_paid' => 250.00,
            'status' => 'paid',
            'line_items' => [
                ['description' => 'Initial Chiropractic Consultation & Spinal Exam', 'qty' => 1, 'unit_price' => 150.00, 'total' => 150.00],
                ['description' => 'Lumbar Mechanical Decompression Session', 'qty' => 1, 'unit_price' => 100.00, 'total' => 100.00],
            ],
            'notes' => 'Paid in full at reception desk.',
        ]);

        Payment::create([
            'invoice_id' => $inv1->id,
            'patient_id' => $createdPatients[0]->id,
            'amount' => 250.00,
            'payment_method' => 'card',
            'reference_number' => 'CARD-AUTH-94812',
            'status' => 'completed',
            'payment_date' => Carbon::now()->subDays(5),
            'notes' => 'Visa ending in 4242',
        ]);

        $inv2 = Invoice::create([
            'invoice_number' => 'INV-2026-002',
            'patient_id' => $createdPatients[1]->id,
            'doctor_id' => $doctors[1]->id,
            'issue_date' => Carbon::now()->subDays(3),
            'due_date' => Carbon::now()->addDays(27),
            'subtotal' => 320.00,
            'tax' => 0.00,
            'total_amount' => 320.00,
            'amount_paid' => 200.00,
            'status' => 'partially_paid',
            'line_items' => [
                ['description' => 'Cervical Spine Adjustment & Myofascial Release', 'qty' => 1, 'unit_price' => 120.00, 'total' => 120.00],
                ['description' => 'Digital Spine X-Ray Diagnostic Scan', 'qty' => 1, 'unit_price' => 200.00, 'total' => 200.00],
            ],
            'notes' => 'Insurance claim pending balance.',
        ]);

        Payment::create([
            'invoice_id' => $inv2->id,
            'patient_id' => $createdPatients[1]->id,
            'amount' => 200.00,
            'payment_method' => 'insurance',
            'reference_number' => 'INS-CLAIM-AETNA-8812',
            'status' => 'completed',
            'payment_date' => Carbon::now()->subDays(3),
            'notes' => 'Aetna Healthcare claim coverage payout.',
        ]);

        $inv3 = Invoice::create([
            'invoice_number' => 'INV-2026-003',
            'patient_id' => $createdPatients[2]->id,
            'doctor_id' => $doctors[0]->id,
            'issue_date' => Carbon::now()->subDays(1),
            'due_date' => Carbon::now()->addDays(29),
            'subtotal' => 120.00,
            'tax' => 0.00,
            'total_amount' => 120.00,
            'amount_paid' => 120.00,
            'status' => 'paid',
            'line_items' => [
                ['description' => 'Postural Rehabilitation & Sciatica Care', 'qty' => 1, 'unit_price' => 120.00, 'total' => 120.00],
            ],
            'notes' => 'Paid in cash.',
        ]);

        Payment::create([
            'invoice_id' => $inv3->id,
            'patient_id' => $createdPatients[2]->id,
            'amount' => 120.00,
            'payment_method' => 'cash',
            'reference_number' => 'CASH-RECEIPT-1029',
            'status' => 'completed',
            'payment_date' => Carbon::now()->subDays(1),
            'notes' => 'Exact cash payment.',
        ]);

        // 6. Seed Notifications (All 4 categories)
        $sampleNotifications = [
            [
                'patient_id' => $createdPatients[0]->id,
                'type' => 'appointment_reminder',
                'title' => 'Upcoming Chiropractic Session Tomorrow',
                'message' => 'Reminder: Robert Martinez has an appointment scheduled tomorrow at 10:30 AM with Dr. Marcus Wright.',
                'scheduled_at' => Carbon::now()->addHours(24),
                'action_url' => '/appointments',
                'read_at' => null,
            ],
            [
                'patient_id' => $createdPatients[1]->id,
                'type' => 'payment_reminder',
                'title' => 'Payment Due: Invoice #INV-2026-002',
                'message' => 'Emily Watson has a remaining balance of $120.00 due on Invoice #INV-2026-002.',
                'scheduled_at' => Carbon::now()->subHours(2),
                'action_url' => '/billing',
                'read_at' => null,
            ],
            [
                'patient_id' => $createdPatients[0]->id,
                'type' => 'birthday_reminder',
                'title' => '🎂 Happy Birthday Robert Martinez!',
                'message' => 'Today is Robert Martinez\'s birthday! Send them birthday greetings and milestone care voucher.',
                'scheduled_at' => Carbon::now(),
                'action_url' => '/patients/' . $createdPatients[0]->id,
                'read_at' => null,
            ],
            [
                'patient_id' => $createdPatients[2]->id,
                'type' => 'followup_reminder',
                'title' => 'Post-Adjustment 7-Day Care Follow-up',
                'message' => '7 days since Lumbar Decompression for Michael Chang. Check in on posture exercise progress.',
                'scheduled_at' => Carbon::now()->subDays(1),
                'action_url' => '/treatment-sessions',
                'read_at' => null,
            ],
        ];

        foreach ($sampleNotifications as $notif) {
            Notification::create($notif);
        }

        // 7. Clinic Settings
        \App\Models\ClinicSetting::current();
    }
}
