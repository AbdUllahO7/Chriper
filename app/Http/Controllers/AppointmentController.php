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
     * Display public/patient online appointment booking portal wizard.
     */
    public function bookingPortal(Request $request): Response
    {
        $doctors = Doctor::all();
        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email', 'phone']);

        return Inertia::render('Appointments/BookingPortal', [
            'doctors' => $doctors,
            'patients' => $patients,
            'services' => [
                ['id' => 'initial_consultation', 'name' => 'Initial Consultation & Full Spinal Exam', 'duration' => 45, 'icon' => '🩺', 'description' => 'Comprehensive posture analysis, range of motion test, and initial chiropractic evaluation.'],
                ['id' => 'spinal_adjustment', 'name' => 'Spinal Adjustment & Realignment', 'duration' => 30, 'icon' => '🦴', 'description' => 'Full spine precision manual adjustment and joint mobilization.'],
                ['id' => 'decompression_therapy', 'name' => 'Lumbar & Cervical Decompression Therapy', 'duration' => 30, 'icon' => '⚡', 'description' => 'Motorized traction therapy targeting herniated discs & sciatica relief.'],
                ['id' => 'subluxation_followup', 'name' => 'Subluxation Follow-up & Re-assessment', 'duration' => 15, 'icon' => '📋', 'description' => 'Quick progress check and maintenance adjustment session.'],
            ],
        ]);
    }

    /**
     * API Endpoint: Get real-time available time slots for a given doctor and date.
     */
    public function availableSlots(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => ['required', 'exists:doctors,id'],
            'date' => ['required', 'date'],
        ]);

        $doctorId = $validated['doctor_id'];
        $date = Carbon::parse($validated['date'])->toDateString();

        $allSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ];

        // Fetch existing booked appointments for the doctor on that date
        $bookedAppointments = Appointment::where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $date)
            ->where('status', '!=', 'cancelled')
            ->get();

        $bookedTimes = $bookedAppointments->map(function ($app) {
            return Carbon::parse($app->appointment_date)->format('H:i');
        })->toArray();

        $slots = array_map(function ($slot) use ($bookedTimes) {
            $formattedTime = Carbon::createFromFormat('H:i', $slot)->format('h:i A');
            $isBooked = in_array($slot, $bookedTimes);
            return [
                'time_24' => $slot,
                'formatted' => $formattedTime,
                'available' => !$isBooked,
                'reason' => $isBooked ? 'Slot Booked' : 'Available',
            ];
        }, $allSlots);

        return response()->json([
            'date' => $date,
            'doctor_id' => $doctorId,
            'slots' => $slots,
        ]);
    }

    /**
     * Cancel an existing appointment.
     */
    public function cancel(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $appointment->update([
            'status' => 'cancelled',
            'notes' => trim(($appointment->notes ? $appointment->notes . "\n" : '') . "Cancelled: " . ($validated['reason'] ?? 'Cancelled by user')),
        ]);

        $patientName = $appointment->patient?->full_name ?? 'Patient';

        return redirect()->back()->with('message', "{$patientName}'s appointment was cancelled.");
    }

    /**
     * Delete an appointment completely.
     */
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->back()->with('message', 'Appointment removed successfully.');
    }
}
