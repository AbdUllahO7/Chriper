<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\TreatmentPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentPlanController extends Controller
{
    /**
     * Display a listing of chiropractic treatment plans.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $patientId = $request->input('patient_id');
        $status = $request->input('status');

        $treatmentPlans = TreatmentPlan::with(['patient', 'doctor'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($pq) use ($search) {
                          $pq->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($patientId, function ($query, $patientId) {
                $query->where('patient_id', $patientId);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);
        $doctors = Doctor::all(['id', 'name', 'specialty']);

        return Inertia::render('TreatmentPlans/Index', [
            'treatmentPlans' => $treatmentPlans,
            'patients' => $patients,
            'doctors' => $doctors,
            'filters' => [
                'search' => $search ?? '',
                'patient_id' => $patientId ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    /**
     * Display detailed Treatment Plan dossier with weekly breakdown & session checklist.
     */
    public function show(TreatmentPlan $treatmentPlan): Response
    {
        $treatmentPlan->load(['patient', 'doctor', 'treatmentSessions']);

        return Inertia::render('TreatmentPlans/Show', [
            'treatmentPlan' => $treatmentPlan,
        ]);
    }

    /**
     * Store a newly created chiropractic treatment plan with auto-generated weekly session checklist.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'total_sessions' => ['required', 'integer', 'min:1', 'max:100'],
            'frequency_per_week' => ['required', 'integer', 'min:1', 'max:7'],
            'start_date' => ['required', 'date'],
        ]);

        $totalSessions = (int) $validated['total_sessions'];
        $frequency = (int) $validated['frequency_per_week'];

        // Auto-generate Weekly Schedule Breakdown (Week 1, Week 2, etc.)
        $totalWeeks = (int) ceil($totalSessions / $frequency);
        $weeksBreakdown = [];

        $sessionCounter = 1;
        for ($w = 1; $w <= $totalWeeks; $w++) {
            $weekSessions = [];
            for ($s = 1; $s <= $frequency && $sessionCounter <= $totalSessions; $s++) {
                $weekSessions[] = [
                    'session_number' => $sessionCounter,
                    'title' => "Session {$sessionCounter}",
                    'completed' => false,
                    'completed_at' => null,
                    'notes' => null,
                ];
                $sessionCounter++;
            }

            $weeksBreakdown[] = [
                'week_number' => $w,
                'title' => "Week {$w}",
                'sessions' => $weekSessions,
            ];
        }

        $startDate = \Carbon\Carbon::parse($validated['start_date']);
        $targetEndDate = (clone $startDate)->addWeeks($totalWeeks);

        $plan = TreatmentPlan::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'total_sessions' => $totalSessions,
            'completed_sessions' => 0,
            'frequency_per_week' => $frequency,
            'start_date' => $startDate,
            'target_end_date' => $targetEndDate,
            'status' => 'active',
            'weeks_breakdown' => $weeksBreakdown,
        ]);

        return redirect()->route('treatment-plans.show', $plan->id)
            ->with('message', 'Chiropractic Treatment Plan created successfully.');
    }

    /**
     * Toggle session completion state inside a treatment plan.
     */
    public function toggleSession(Request $request, TreatmentPlan $treatmentPlan, int $sessionNumber)
    {
        $weeksBreakdown = $treatmentPlan->weeks_breakdown ?? [];
        $completedCount = 0;

        foreach ($weeksBreakdown as &$week) {
            if (isset($week['sessions']) && is_array($week['sessions'])) {
                foreach ($week['sessions'] as &$sess) {
                    if ((int) $sess['session_number'] === (int) $sessionNumber) {
                        $sess['completed'] = !($sess['completed'] ?? false);
                        $sess['completed_at'] = $sess['completed'] ? now()->toDateTimeString() : null;
                    }

                    if ($sess['completed'] ?? false) {
                        $completedCount++;
                    }
                }
            }
        }

        $status = $treatmentPlan->status;
        if ($completedCount >= $treatmentPlan->total_sessions) {
            $status = 'completed';
        } elseif ($completedCount < $treatmentPlan->total_sessions && $status === 'completed') {
            $status = 'active';
        }

        $treatmentPlan->update([
            'weeks_breakdown' => $weeksBreakdown,
            'completed_sessions' => $completedCount,
            'status' => $status,
        ]);

        return redirect()->back()->with('message', "Session {$sessionNumber} status updated.");
    }

    /**
     * Update the specified treatment plan details.
     */
    public function update(Request $request, TreatmentPlan $treatmentPlan)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,completed,paused,cancelled'],
            'target_end_date' => ['nullable', 'date'],
        ]);

        $treatmentPlan->update($validated);

        return redirect()->back()->with('message', 'Treatment Plan updated successfully.');
    }

    /**
     * Remove the specified treatment plan.
     */
    public function destroy(TreatmentPlan $treatmentPlan)
    {
        $treatmentPlan->delete();

        return redirect()->route('treatment-plans.index')
            ->with('message', 'Treatment plan deleted successfully.');
    }
}
