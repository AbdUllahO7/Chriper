<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display listing of clinical reminders and notifications.
     */
    public function index(Request $request): Response
    {
        $type = $request->input('type');
        $status = $request->input('status'); // unread, read, all

        $notifications = Notification::with('patient')
            ->when($type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($status === 'unread', function ($query) {
                $query->whereNull('read_at');
            })
            ->when($status === 'read', function ($query) {
                $query->whereNotNull('read_at');
            })
            ->latest('scheduled_at')
            ->get();

        $unreadCount = Notification::whereNull('read_at')->count();
        $patients = Patient::where('status', 'active')->get(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'patients' => $patients,
            'filters' => [
                'type' => $type ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        $notification->update(['read_at' => now()]);

        return redirect()->back()->with('message', 'Notification marked as read.');
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead()
    {
        Notification::whereNull('read_at')->update(['read_at' => now()]);

        return redirect()->back()->with('message', 'All notifications marked as read.');
    }

    /**
     * Dispatch a manual reminder to a patient.
     */
    public function sendManualReminder(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'type' => ['required', Rule::in(['appointment_reminder', 'payment_reminder', 'birthday_reminder', 'followup_reminder'])],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $actionUrl = match ($validated['type']) {
            'appointment_reminder' => '/appointments',
            'payment_reminder' => '/billing',
            'followup_reminder' => '/treatment-sessions',
            'birthday_reminder' => '/patients/' . $validated['patient_id'],
        };

        Notification::create([
            'user_id' => auth()->id(),
            'patient_id' => $validated['patient_id'],
            'type' => $validated['type'],
            'title' => $validated['title'],
            'message' => $validated['message'],
            'scheduled_at' => now(),
            'action_url' => $actionUrl,
        ]);

        return redirect()->back()->with('message', 'Patient reminder dispatched successfully.');
    }

    /**
     * Delete a notification.
     */
    public function destroy(Notification $notification)
    {
        $notification->delete();

        return redirect()->back()->with('message', 'Notification deleted.');
    }
}
