<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\TreatmentSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentSessionController extends Controller
{
    /**
     * Display a listing of chiropractic treatment sessions.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $patientId = $request->input('patient_id');

        $treatmentSessions = TreatmentSession::with(['patient', 'doctor'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('treatment_type', 'like', "%{$search}%")
                      ->orWhere('notes', 'like', "%{$search}%")
                      ->orWhere('recommendations', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($patientId, function ($query, $patientId) {
                $query->where('patient_id', $patientId);
            })
            ->latest('session_date')
            ->get();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);
        $doctors = Doctor::all(['id', 'name', 'specialty']);

        $predefinedAdjustmentAreas = [
            'Cervical C1-C4 (Upper Neck)',
            'Cervical C5-C7 (Lower Neck)',
            'Thoracic T1-T6 (Upper Back)',
            'Thoracic T7-T12 (Mid Back)',
            'Lumbar L1-L3 (Upper Lumbar)',
            'Lumbar L4-S1 (Lower Lumbar)',
            'Sacrum / SI Joint',
            'Pelvis & Hip Complex',
            'Extremities (Shoulder/Knee)',
        ];

        return Inertia::render('TreatmentSessions/Index', [
            'treatmentSessions' => $treatmentSessions,
            'patients' => $patients,
            'doctors' => $doctors,
            'predefinedAdjustmentAreas' => $predefinedAdjustmentAreas,
            'filters' => [
                'search' => $search ?? '',
                'patient_id' => $patientId ?? '',
            ],
        ]);
    }

    /**
     * Display a specific treatment session details & recommendations.
     */
    public function show(TreatmentSession $treatmentSession): Response
    {
        $treatmentSession->load(['patient', 'doctor']);

        return Inertia::render('TreatmentSessions/Show', [
            'treatmentSession' => $treatmentSession,
        ]);
    }

    /**
     * Store a newly created treatment session record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'session_date' => ['required', 'date'],
            'treatment_type' => ['required', 'string', 'max:255'],
            'adjustment_areas' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'recommendations' => ['nullable', 'string', 'max:2000'],
        ]);

        $session = TreatmentSession::create($validated);

        return redirect()->route('treatment-sessions.show', $session->id)
            ->with('message', 'Treatment session recorded successfully.');
    }

    /**
     * Update the specified treatment session record.
     */
    public function update(Request $request, TreatmentSession $treatmentSession)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'session_date' => ['required', 'date'],
            'treatment_type' => ['required', 'string', 'max:255'],
            'adjustment_areas' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'recommendations' => ['nullable', 'string', 'max:2000'],
        ]);

        $treatmentSession->update($validated);

        return redirect()->back()->with('message', 'Treatment session updated successfully.');
    }

    /**
     * Remove the specified treatment session record.
     */
    public function destroy(TreatmentSession $treatmentSession)
    {
        $treatmentSession->delete();

        return redirect()->route('treatment-sessions.index')
            ->with('message', 'Treatment session deleted successfully.');
    }
}
