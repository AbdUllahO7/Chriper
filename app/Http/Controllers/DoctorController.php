<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    /**
     * Display a listing of doctors (chiropractors) with search and availability filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $doctors = Doctor::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('specialty', 'like', "%{$search}%")
                      ->orWhere('room_number', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('availability_status', $status);
            })
            ->latest()
            ->get();

        return Inertia::render('Doctors/Index', [
            'doctors' => $doctors,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
            'statuses' => ['available', 'busy', 'off_duty'],
        ]);
    }

    /**
     * Store a newly created doctor profile.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'specialty' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:doctors,email'],
            'working_hours' => ['required', 'string', 'max:255'],
            'room_number' => ['required', 'string', 'max:100'],
            'availability_status' => ['required', Rule::in(['available', 'busy', 'off_duty'])],
        ]);

        $validated['is_available'] = $validated['availability_status'] === 'available';

        Doctor::create($validated);

        return redirect()->back()->with('message', 'Doctor profile created successfully.');
    }

    /**
     * Update the specified doctor details.
     */
    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'specialty' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('doctors')->ignore($doctor->id)],
            'working_hours' => ['required', 'string', 'max:255'],
            'room_number' => ['required', 'string', 'max:100'],
            'availability_status' => ['required', Rule::in(['available', 'busy', 'off_duty'])],
        ]);

        $validated['is_available'] = $validated['availability_status'] === 'available';

        $doctor->update($validated);

        return redirect()->back()->with('message', 'Doctor profile updated successfully.');
    }

    /**
     * Fast toggle route for changing doctor availability status.
     */
    public function toggleAvailability(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'availability_status' => ['required', Rule::in(['available', 'busy', 'off_duty'])],
        ]);

        $status = $validated['availability_status'];

        $doctor->update([
            'availability_status' => $status,
            'is_available' => $status === 'available',
        ]);

        return redirect()->back()->with('message', "Doctor availability set to {$status}.");
    }

    /**
     * Remove the specified doctor profile.
     */
    public function destroy(Doctor $doctor)
    {
        $doctor->delete();

        return redirect()->back()->with('message', 'Doctor profile deleted successfully.');
    }
}
