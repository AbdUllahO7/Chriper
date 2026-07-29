<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    /**
     * Display appointment scheduling calendar (weekly, daily, list views).
     */
    public function index(Request $request): Response
    {
        $selectedDate = $request->input('date', Carbon::today()->toDateString());
        $viewMode = $request->input('view', 'weekly'); // 'weekly', 'daily', 'list'

        $appointments = Appointment::with(['patient', 'doctor', 'chiropractor'])
            ->latest('appointment_date')
            ->get();

        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email', 'phone']);
        $doctors = Doctor::all();

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'patients' => $patients,
            'doctors' => $doctors,
            'selectedDate' => $selectedDate,
            'viewMode' => $viewMode,
            'statuses' => [
                'scheduled',
                'checked_in',
                'in_progress',
                'completed',
                'cancelled',
                'no_show',
            ],
            'durations' => [15, 30, 45, 60],
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'string'],
            'duration' => ['required', 'integer', Rule::in([15, 30, 45, 60])],
            'status' => ['required', Rule::in(['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'])],
            'service_type' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = Doctor::find($validated['doctor_id']);

        $datetimeString = "{$validated['appointment_date']} {$validated['appointment_time']}";
        $fullAppointmentDate = Carbon::parse($datetimeString);

        Appointment::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'],
            'chiropractor_id' => $doctor?->user_id,
            'appointment_date' => $fullAppointmentDate,
            'duration' => $validated['duration'],
            'status' => $validated['status'],
            'service_type' => $validated['service_type'],
            'notes' => $validated['notes'],
        ]);

        $patient = Patient::find($validated['patient_id']);

        return redirect()->back()->with('message', "Appointment booked for {$patient->full_name} on " . $fullAppointmentDate->format('M d, Y @ h:i A'));
    }

    /**
     * Update appointment details or status.
     */
    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'string'],
            'duration' => ['required', 'integer', Rule::in([15, 30, 45, 60])],
            'status' => ['required', Rule::in(['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'])],
            'service_type' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = Doctor::find($validated['doctor_id']);
        $datetimeString = "{$validated['appointment_date']} {$validated['appointment_time']}";
        $fullAppointmentDate = Carbon::parse($datetimeString);

        $appointment->update([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'],
            'chiropractor_id' => $doctor?->user_id,
            'appointment_date' => $fullAppointmentDate,
            'duration' => $validated['duration'],
            'status' => $validated['status'],
            'service_type' => $validated['service_type'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->back()->with('message', "Appointment updated successfully.");
    }

    /**
     * Rapid Drag & Drop endpoint for rescheduling appointment date & time.
     */
    public function reschedule(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'appointment_date' => ['required', 'date'],
            'duration' => ['nullable', 'integer'],
        ]);

        $newDate = Carbon::parse($validated['appointment_date']);

        $appointment->update([
            'appointment_date' => $newDate,
            'duration' => $validated['duration'] ?? $appointment->duration,
        ]);

        $patientName = $appointment->patient?->full_name ?? 'Patient';

        return redirect()->back()->with('message', "{$patientName}'s appointment rescheduled to " . $newDate->format('D, M d @ h:i A'));
    }

    /**
     * Delete/Cancel an appointment.
     */
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->back()->with('message', 'Appointment removed successfully.');
    }
}
