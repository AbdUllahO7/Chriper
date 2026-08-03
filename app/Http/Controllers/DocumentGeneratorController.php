<?php

namespace App\Http\Controllers;

use App\Models\ClinicSetting;
use App\Models\Doctor;
use App\Models\GeneratedDocument;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentGeneratorController extends Controller
{
    /**
     * Display Document Generator Hub & Library.
     */
    public function index(Request $request): Response
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'dob', 'phone', 'email')->get();
        $doctors = Doctor::select('id', 'name', 'specialty')->get();

        // Seed initial sample document if database is fresh
        if (GeneratedDocument::count() === 0 && $patients->isNotEmpty()) {
            $patient = $patients->first();
            $doctor = $doctors->first();

            GeneratedDocument::create([
                'document_number' => 'DOC-2026-1001',
                'document_type' => 'sick_leave_certificate',
                'patient_id' => $patient->id,
                'doctor_id' => $doctor ? $doctor->id : null,
                'title' => "Medical Sick Leave Certificate - {$patient->first_name} {$patient->last_name}",
                'content_json' => [
                    'start_date' => Carbon::today()->format('Y-m-d'),
                    'end_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                    'leave_days' => 3,
                    'diagnosis_summary' => 'Acute Lumbar Radiculopathy & L4-L5 Muscle Spasm',
                    'fitness_remarks' => 'Patient is recommended strict bed rest and spinal decompression therapy. Unfit for manual labor or heavy lifting.',
                ],
                'issued_at' => Carbon::today(),
            ]);

            GeneratedDocument::create([
                'document_number' => 'DOC-2026-1002',
                'document_type' => 'medical_report',
                'patient_id' => $patient->id,
                'doctor_id' => $doctor ? $doctor->id : null,
                'title' => "Comprehensive Spinal Diagnostic Report - {$patient->first_name} {$patient->last_name}",
                'content_json' => [
                    'chief_complaint' => 'Persistent lower back pain radiating down left leg (NRS Pain Score 7/10)',
                    'clinical_findings' => 'Palpation revealed severe bilateral paraspinal muscle tightness. Reduced lumbar flexion.',
                    'diagnosis' => 'L5-S1 Disc Herniation with Sciatica',
                    'treatment_plan' => '12 Weeks Spinal Decompression, Cold Laser Therapy, and Core Stabilization Exercises.',
                ],
                'issued_at' => Carbon::today(),
            ]);
        }

        $documents = GeneratedDocument::with(['patient', 'doctor'])
            ->latest('issued_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'patients' => $patients,
            'doctors' => $doctors,
        ]);
    }

    /**
     * Generate & store a new clinical/financial document.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_type' => ['required', Rule::in(['medical_report', 'sick_leave_certificate', 'referral_letter', 'treatment_summary', 'pdf_invoice'])],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['nullable', 'exists:doctors,id'],
            'title' => ['required', 'string', 'max:255'],
            'issued_at' => ['required', 'date'],
            'content_json' => ['required', 'array'],
        ]);

        $serialNumber = 'DOC-' . Carbon::now()->format('Y') . '-' . rand(1000, 9999);

        $doc = GeneratedDocument::create([
            'document_number' => $serialNumber,
            'document_type' => $validated['document_type'],
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'] ?? null,
            'title' => $validated['title'],
            'content_json' => $validated['content_json'],
            'issued_at' => $validated['issued_at'],
        ]);

        return redirect()->back()->with('message', "Document {$doc->document_number} generated successfully.");
    }

    /**
     * Display printable high-resolution document preview.
     */
    public function show(GeneratedDocument $document): Response
    {
        $document->load(['patient', 'doctor']);
        $clinic = ClinicSetting::first();

        return Inertia::render('Documents/PrintPreview', [
            'document' => [
                'id' => $document->id,
                'document_number' => $document->document_number,
                'document_type' => $document->document_type,
                'title' => $document->title,
                'issued_at' => $document->issued_at ? $document->issued_at->format('F d, Y') : null,
                'content' => $document->content_json,
                'patient' => $document->patient ? [
                    'name' => "{$document->patient->first_name} {$document->patient->last_name}",
                    'dob' => $document->patient->dob,
                    'phone' => $document->patient->phone,
                    'email' => $document->patient->email,
                    'address' => $document->patient->address,
                ] : null,
                'doctor' => $document->doctor ? [
                    'name' => $document->doctor->name,
                    'specialty' => $document->doctor->specialty,
                    'phone' => $document->doctor->phone,
                ] : null,
            ],
            'clinic' => $clinic ? [
                'clinic_name' => $clinic->clinic_name,
                'address' => $clinic->address,
                'phone' => $clinic->phone,
                'email' => $clinic->email,
                'website' => $clinic->website,
                'tax_number' => $clinic->tax_number,
            ] : [
                'clinic_name' => 'Chirper Chiropractic & Spine Clinic',
                'address' => '742 Evergreen Terrace, Suite 100, Medical District',
                'phone' => '(555) 019-2831',
                'email' => 'contact@chirperspine.com',
                'website' => 'www.chirperspine.com',
                'tax_number' => 'TX-9921-88',
            ],
        ]);
    }

    /**
     * Remove generated document.
     */
    public function destroy(GeneratedDocument $document)
    {
        $number = $document->document_number;
        $document->delete();

        return redirect()->back()->with('message', "Document {$number} deleted.");
    }
}
