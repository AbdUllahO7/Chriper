<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /**
     * Display a paginated listing of patients with search and filter capabilities.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $gender = $request->input('gender');
        $status = $request->input('status');

        $patients = Patient::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($gender, function ($query, $gender) {
                $query->where('gender', $gender);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters' => [
                'search' => $search ?? '',
                'gender' => $gender ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    /**
     * Display a specific patient's comprehensive profile dossier and medical history.
     */
    public function show(Patient $patient): Response
    {
        $patient->load([
            'appointments' => function ($q) {
                $q->with('chiropractor')->latest();
            },
            'medicalRecords' => function ($q) {
                $q->with(['doctor', 'attachments'])->latest('record_date');
            },
            'treatmentSessions' => function ($q) {
                $q->with('doctor')->latest('session_date');
            },
            'treatmentPlans' => function ($q) {
                $q->with('doctor')->latest();
            },
            'consentForms' => function ($q) {
                $q->latest();
            },
            'medicalImages' => function ($q) {
                $q->latest('scan_date');
            },
            'invoices' => function ($q) {
                $q->with('payments')->latest('issue_date');
            },


            'payments' => function ($q) {
                $q->latest();
            },
        ]);

        return Inertia::render('Patients/Show', [
            'patient' => $patient,
        ]);
    }


    /**
     * Store a newly created patient with profile photo upload.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:patients,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
            'insurance' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'profile_photo' => ['nullable', 'image', 'max:2048'], // 2MB Max
        ]);

        if ($request->hasFile('profile_photo')) {
            $validated['profile_photo_path'] = $request->file('profile_photo')->store('patients', 'public');
        }

        Patient::create($validated);

        return redirect()->back()->with('message', 'Patient registered successfully.');
    }

    /**
     * Update the specified patient details and profile photo.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('patients')->ignore($patient->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
            'insurance' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('profile_photo')) {
            if ($patient->profile_photo_path) {
                Storage::disk('public')->delete($patient->profile_photo_path);
            }
            $validated['profile_photo_path'] = $request->file('profile_photo')->store('patients', 'public');
        }

        $patient->update($validated);

        return redirect()->back()->with('message', 'Patient details updated successfully.');
    }

    /**
     * Remove the specified patient from storage.
     */
    public function destroy(Patient $patient)
    {
        if ($patient->profile_photo_path) {
            Storage::disk('public')->delete($patient->profile_photo_path);
        }

        $patient->delete();

        return redirect()->route('patients.index')->with('message', 'Patient deleted successfully.');
    }
}
