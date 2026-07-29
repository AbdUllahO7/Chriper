<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\MedicalRecordAttachment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of patient medical records.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $patientId = $request->input('patient_id');

        $medicalRecords = MedicalRecord::with(['patient', 'doctor', 'attachments'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('chief_complaint', 'like', "%{$search}%")
                      ->orWhere('diagnosis', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($patientId, function ($query, $patientId) {
                $query->where('patient_id', $patientId);
            })
            ->latest('record_date')
            ->get();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);
        $doctors = Doctor::all(['id', 'name', 'specialty']);

        return Inertia::render('MedicalRecords/Index', [
            'medicalRecords' => $medicalRecords,
            'patients' => $patients,
            'doctors' => $doctors,
            'filters' => [
                'search' => $search ?? '',
                'patient_id' => $patientId ?? '',
            ],
        ]);
    }

    /**
     * Display a specific clinical medical record dossier with all 9 sections & attachments.
     */
    public function show(MedicalRecord $medicalRecord): Response
    {
        $medicalRecord->load(['patient', 'doctor', 'attachments']);

        return Inertia::render('MedicalRecords/Show', [
            'medicalRecord' => $medicalRecord,
        ]);
    }

    /**
     * Store a newly created medical record with 9 sections and file attachment uploads.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'chief_complaint' => ['required', 'string'],
            'pain_level' => ['required', 'integer', 'min:1', 'max:10'],
            'medical_history' => ['nullable', 'string'],
            'current_medications' => ['nullable', 'string'],
            'allergies' => ['nullable', 'string'],
            'physical_examination' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'treatment_plan' => ['nullable', 'string'],
            'progress_notes' => ['nullable', 'string'],
            'attachments.*' => ['nullable', 'file', 'max:10240'], // 10MB Max per file
        ]);

        $record = MedicalRecord::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'],
            'chief_complaint' => $validated['chief_complaint'],
            'pain_level' => $validated['pain_level'],
            'medical_history' => $validated['medical_history'] ?? null,
            'current_medications' => $validated['current_medications'] ?? null,
            'allergies' => $validated['allergies'] ?? null,
            'physical_examination' => $validated['physical_examination'] ?? null,
            'diagnosis' => $validated['diagnosis'] ?? null,
            'treatment_plan' => $validated['treatment_plan'] ?? null,
            'progress_notes' => $validated['progress_notes'] ?? null,
            'record_date' => now(),
        ]);

        // Process File Attachments Upload (Images, PDFs, X-rays)
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $originalName = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                $fileSize = $file->getSize();
                $extension = strtolower($file->getClientOriginalExtension());

                $fileType = 'image';
                if ($extension === 'pdf' || str_contains($mimeType, 'pdf')) {
                    $fileType = 'pdf';
                } elseif (str_contains($originalName, 'xray') || str_contains($originalName, 'x-ray') || str_contains($originalName, 'radiology')) {
                    $fileType = 'xray';
                }

                $storedPath = $file->store('medical_records', 'public');

                MedicalRecordAttachment::create([
                    'medical_record_id' => $record->id,
                    'file_name' => $originalName,
                    'file_path' => $storedPath,
                    'file_type' => $fileType,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                ]);
            }
        }

        return redirect()->route('medical-records.show', $record->id)
            ->with('message', 'Clinical medical record created successfully.');
    }

    /**
     * Update the specified medical record.
     */
    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'chief_complaint' => ['required', 'string'],
            'pain_level' => ['required', 'integer', 'min:1', 'max:10'],
            'medical_history' => ['nullable', 'string'],
            'current_medications' => ['nullable', 'string'],
            'allergies' => ['nullable', 'string'],
            'physical_examination' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'treatment_plan' => ['nullable', 'string'],
            'progress_notes' => ['nullable', 'string'],
            'attachments.*' => ['nullable', 'file', 'max:10240'],
        ]);

        $medicalRecord->update($validated);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $originalName = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                $fileSize = $file->getSize();
                $extension = strtolower($file->getClientOriginalExtension());

                $fileType = 'image';
                if ($extension === 'pdf' || str_contains($mimeType, 'pdf')) {
                    $fileType = 'pdf';
                } elseif (str_contains($originalName, 'xray') || str_contains($originalName, 'x-ray')) {
                    $fileType = 'xray';
                }

                $storedPath = $file->store('medical_records', 'public');

                MedicalRecordAttachment::create([
                    'medical_record_id' => $medicalRecord->id,
                    'file_name' => $originalName,
                    'file_path' => $storedPath,
                    'file_type' => $fileType,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                ]);
            }
        }

        return redirect()->back()->with('message', 'Medical record updated successfully.');
    }

    /**
     * Remove the specified medical record & files.
     */
    public function destroy(MedicalRecord $medicalRecord)
    {
        foreach ($medicalRecord->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $medicalRecord->delete();

        return redirect()->route('medical-records.index')->with('message', 'Medical record deleted successfully.');
    }
}
