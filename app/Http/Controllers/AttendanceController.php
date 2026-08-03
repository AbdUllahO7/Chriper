<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display Staff Attendance Workstation & Timesheets.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Seed sample attendance data if database is fresh
        if (AttendanceRecord::count() === 0) {
            $allUsers = User::all();
            foreach ($allUsers as $u) {
                // Seed completed shift yesterday
                $clockIn = Carbon::yesterday()->setHour(8)->setMinute(30);
                $clockOut = Carbon::yesterday()->setHour(18)->setMinute(0); // 9.5 hours total (1.5h overtime)
                AttendanceRecord::create([
                    'user_id' => $u->id,
                    'clock_in_at' => $clockIn,
                    'clock_out_at' => $clockOut,
                    'break_duration_minutes' => 30,
                    'working_hours' => 9.0,
                    'overtime_hours' => 1.0,
                    'status' => 'clocked_out',
                    'notes' => 'Regular clinical shift',
                ]);
            }
        }

        // Active shift record for currently logged-in staff
        $activeShift = AttendanceRecord::where('user_id', $currentUser->id)
            ->whereDate('clock_in_at', $today)
            ->latest()
            ->first();

        // KPI metrics
        $todayHoursWorked = AttendanceRecord::where('user_id', $currentUser->id)
            ->whereDate('clock_in_at', $today)
            ->sum('working_hours');

        $monthlyOvertimeHours = AttendanceRecord::where('user_id', $currentUser->id)
            ->where('clock_in_at', '>=', $startOfMonth)
            ->sum('overtime_hours');

        $activeStaffCount = AttendanceRecord::whereDate('clock_in_at', $today)
            ->whereIn('status', ['clocked_in', 'on_break'])
            ->count();

        $pendingLeaveCount = LeaveRequest::where('status', 'pending')->count();

        // Clinic Staff Live Presence List Today
        $allUsers = User::all();
        $staffPresenceList = $allUsers->map(function ($u) use ($today) {
            $record = AttendanceRecord::where('user_id', $u->id)
                ->whereDate('clock_in_at', $today)
                ->latest()
                ->first();

            return [
                'user_id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role ?? 'staff',
                'status' => $record ? $record->status : 'absent',
                'clock_in_at' => $record && $record->clock_in_at ? $record->clock_in_at->format('h:i A') : null,
                'clock_out_at' => $record && $record->clock_out_at ? $record->clock_out_at->format('h:i A') : null,
                'working_hours' => $record ? (float) $record->working_hours : 0.0,
            ];
        });

        // Paginated Timesheets Log
        $timesheets = AttendanceRecord::with('user')
            ->latest('clock_in_at')
            ->paginate(15)
            ->withQueryString();

        // Leave Requests
        $leaveRequests = LeaveRequest::with(['user', 'approver'])
            ->latest()
            ->get();

        return Inertia::render('Attendance/Index', [
            'activeShift' => $activeShift ? [
                'id' => $activeShift->id,
                'status' => $activeShift->status,
                'clock_in_at' => $activeShift->clock_in_at ? $activeShift->clock_in_at->format('Y-m-d H:i:s') : null,
                'clock_out_at' => $activeShift->clock_out_at ? $activeShift->clock_out_at->format('Y-m-d H:i:s') : null,
                'working_hours' => (float) $activeShift->working_hours,
                'overtime_hours' => (float) $activeShift->overtime_hours,
            ] : null,
            'metrics' => [
                'today_hours' => (float) $todayHoursWorked,
                'monthly_overtime' => (float) $monthlyOvertimeHours,
                'active_staff_count' => $activeStaffCount,
                'pending_leave_count' => $pendingLeaveCount,
            ],
            'staffPresenceList' => $staffPresenceList,
            'timesheets' => $timesheets,
            'leaveRequests' => $leaveRequests,
        ]);
    }

    /**
     * Process 1-Click Clock In.
     */
    public function clockIn(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        $existing = AttendanceRecord::where('user_id', $user->id)
            ->whereDate('clock_in_at', $today)
            ->where('status', 'clocked_in')
            ->first();

        if ($existing) {
            return redirect()->back()->with('message', 'You are already clocked in.');
        }

        AttendanceRecord::create([
            'user_id' => $user->id,
            'clock_in_at' => now(),
            'status' => 'clocked_in',
        ]);

        return redirect()->back()->with('message', 'Clocked in successfully at ' . now()->format('h:i A') . '!');
    }

    /**
     * Process 1-Click Clock Out.
     */
    public function clockOut(Request $request)
    {
        $user = $request->user();
        $record = AttendanceRecord::where('user_id', $user->id)
            ->whereIn('status', ['clocked_in', 'on_break'])
            ->latest()
            ->first();

        if (!$record) {
            return redirect()->back()->with('message', 'No active clock-in session found.');
        }

        $clockOutTime = now();
        $clockInTime = Carbon::parse($record->clock_in_at);
        $totalMinutes = max(0, $clockOutTime->diffInMinutes($clockInTime) - $record->break_duration_minutes);
        $workingHours = round($totalMinutes / 60, 2);

        // Standard daily shift is 8 hours; anything above is overtime
        $overtime = max(0.00, round($workingHours - 8.0, 2));

        $record->update([
            'clock_out_at' => $clockOutTime,
            'working_hours' => $workingHours,
            'overtime_hours' => $overtime,
            'status' => 'clocked_out',
        ]);

        return redirect()->back()->with('message', "Clocked out successfully! Total Hours Worked: {$workingHours} hrs (Overtime: {$overtime} hrs).");
    }

    /**
     * Submit Leave Application.
     */
    public function storeLeaveRequest(Request $request)
    {
        $validated = $request->validate([
            'leave_type' => ['required', Rule::in(['vacation', 'sick_leave', 'personal', 'maternity_paternity', 'unpaid'])],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $days = $startDate->diffInDays($endDate) + 1;

        LeaveRequest::create([
            'user_id' => $request->user()->id,
            'leave_type' => $validated['leave_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_days' => $days,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('message', 'Leave request submitted for approval.');
    }

    /**
     * Admin/Doctor Approve or Reject Leave Application.
     */
    public function updateLeaveStatus(Request $request, LeaveRequest $leaveRequest)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $leaveRequest->update([
            'status' => $validated['status'],
            'approved_by_user_id' => $request->user()->id,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return redirect()->back()->with('message', "Leave request marked as {$validated['status']}.");
    }
}
