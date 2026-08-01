<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\MedicalImage;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MedicalImageController extends Controller
{
    /**
     * Display a listing of medical images (X-Rays, MRIs, CT Scans).
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $imageType = $request->input('image_type');
        $bodyRegion = $request->input('body_region');
        $patientId = $request->input('patient_id');

        $medicalImages = MedicalImage::with(['patient', 'doctor'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('body_region', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($imageType, function ($query, $imageType) {
                $query->where('image_type', $imageType);
            })
            ->when($bodyRegion, function ($query, $bodyRegion) {
                $query->where('body_region', $bodyRegion);
            })
            ->when($patientId, function ($query, $patientId) {
                $query->where('patient_id', $patientId);
            })
            ->latest('scan_date')
            ->paginate(12)
            ->withQueryString();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);
        $doctors = Doctor::all(['id', 'name', 'specialty']);

        return Inertia::render('MedicalImages/Index', [
            'medicalImages' => $medicalImages,
            'patients' => $patients,
            'doctors' => $doctors,
            'filters' => [
                'search' => $search ?? '',
                'image_type' => $imageType ?? '',
                'body_region' => $bodyRegion ?? '',
                'patient_id' => $patientId ?? '',
            ],
            'bodyRegions' => [
                'Cervical Spine',
                'Thoracic Spine',
                'Lumbar Spine',
                'Full Spine',
                'Pelvis & Sacroiliac',
                'Shoulder & Extremities',
            ],
        ]);
    }

    /**
     * Store a newly uploaded medical scan image.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['nullable', 'exists:doctors,id'],
            'image_type' => ['required', 'in:xray,mri,ct_scan'],
            'body_region' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'scan_date' => ['required', 'date'],
            'file' => ['required', 'file', 'mimes:jpeg,png,jpg,webp,dicom,dcm,pdf', 'max:20480'], // Max 20MB
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $filePath = null;
        $fileSize = 0;

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $fileSize = $uploadedFile->getSize();
            $filename = 'medical_images/' . time() . '_' . uniqid() . '.' . $uploadedFile->getClientOriginalExtension();
            $filePath = $uploadedFile->storeAs('medical_images', basename($filename), 'public');
        }

        $medicalImage = MedicalImage::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'] ?? null,
            'image_type' => $validated['image_type'],
            'body_region' => $validated['body_region'],
            'title' => $validated['title'],
            'scan_date' => $validated['scan_date'],
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('medical-images.show', $medicalImage->id)
            ->with('message', "Medical scan '{$medicalImage->title}' uploaded successfully.");
    }

    /**
     * Display diagnostic radiology workstation for a specific scan.
     */
    public function show(MedicalImage $medicalImage): Response
    {
        $medicalImage->load(['patient', 'doctor']);

        // Fetch other scans of the same patient for quick comparison selection
        $otherScans = MedicalImage::where('patient_id', $medicalImage->patient_id)
            ->where('id', '!=', $medicalImage->id)
            ->latest('scan_date')
            ->get();

        return Inertia::render('MedicalImages/Show', [
            'medicalImage' => $medicalImage,
            'otherScans' => $otherScans,
        ]);
    }

    /**
     * Display Before/After comparison workstation view.
     */
    public function compare(Request $request): Response
    {
        $imageAId = $request->input('image_a');
        $imageBId = $request->input('image_b');

        $imageA = MedicalImage::with(['patient', 'doctor'])->find($imageAId);
        $imageB = MedicalImage::with(['patient', 'doctor'])->find($imageBId);

        return Inertia::render('MedicalImages/Compare', [
            'imageA' => $imageA,
            'imageB' => $imageB,
        ]);
    }

    /**
     * Delete a medical scan.
     */
    public function destroy(MedicalImage $medicalImage)
    {
        if ($medicalImage->file_path && Storage::disk('public')->exists($medicalImage->file_path)) {
            Storage::disk('public')->delete($medicalImage->file_path);
        }

        $medicalImage->delete();

        return redirect()->route('medical-images.index')
            ->with('message', 'Medical scan removed.');
    }
}
