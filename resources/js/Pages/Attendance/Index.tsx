import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export interface ActiveShift {
    id: number;
    status: 'clocked_in' | 'clocked_out' | 'on_break';
    clock_in_at: string | null;
    clock_out_at: string | null;
    working_hours: number;
    overtime_hours: number;
}

export interface StaffPresence {
    user_id: number;
    name: string;
    email: string;
    role: string;
    status: 'clocked_in' | 'clocked_out' | 'on_break' | 'absent';
    clock_in_at: string | null;
    clock_out_at: string | null;
    working_hours: number;
}

export interface TimesheetItem {
    id: number;
    user?: { id: number; name: string; email: string };
    clock_in_at: string | null;
    clock_out_at: string | null;
    break_duration_minutes: number;
    working_hours: number;
    overtime_hours: number;
    status: string;
    notes: string | null;
}

export interface LeaveRequestItem {
    id: number;
    leave_type: 'vacation' | 'sick_leave' | 'personal' | 'maternity_paternity' | 'unpaid';
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string | null;
    user?: { id: number; name: string; email: string };
    approver?: { id: number; name: string } | null;
}

interface IndexProps {
    activeShift: ActiveShift | null;
    metrics: {
        today_hours: number;
        monthly_overtime: number;
        active_staff_count: number;
        pending_leave_count: number;
    };
    staffPresenceList: StaffPresence[];
    timesheets: {
        data: TimesheetItem[];
        links: any[];
    };
    leaveRequests: LeaveRequestItem[];
}

export default function Index({
    activeShift,
    metrics,
    staffPresenceList,
    timesheets,
    leaveRequests,
}: IndexProps) {
    const user = usePage().props.auth.user;

    // Real-time digital clock state
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Leave Application Form
    const leaveForm = useForm({
        leave_type: 'vacation' as LeaveRequestItem['leave_type'],
        start_date: '',
        end_date: '',
        reason: '',
    });

    const handleClockIn = () => {
        router.post(route('attendance.clock-in'), {}, { preserveScroll: true });
    };

    const handleClockOut = () => {
        router.post(route('attendance.clock-out'), {}, { preserveScroll: true });
    };

    const handleLeaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        leaveForm.post(route('leave-requests.store'), {
            onSuccess: () => {
                setIsLeaveModalOpen(false);
                leaveForm.reset();
            },
        });
    };

    const handleUpdateLeaveStatus = (leaveId: number, status: 'approved' | 'rejected') => {
        router.patch(
            route('leave-requests.update-status', leaveId),
            { status },
            { preserveScroll: true }
        );
    };

    const getLeaveBadgeStyle = (type: string) => {
        switch (type) {
            case 'vacation':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'sick_leave':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'personal':
                return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            default:
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Staff Attendance, <span className="gradient-text">Timesheets & Leave</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Track employee clock in/out, working shift hours, overtime calculations, and leave applications.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsLeaveModalOpen(true)}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                        >
                            <span>🌴 Request Leave</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Staff Attendance" />

            <div className="space-y-8">
                {/* Clock Punch Widget & Top KPIs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 1-Click Clock Punch Card */}
                    <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 relative overflow-hidden bg-gradient-to-br from-purple-950/20 via-[#0b0f19] to-[#0b0f19]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Staff Shift Punch Control</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-mono border ${
                                    activeShift?.status === 'clocked_in'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                                }`}
                            >
                                {activeShift?.status === 'clocked_in' ? '🟢 Clocked In' : '🔴 Clocked Out'}
                            </span>
                        </div>

                        {/* Real-time Clock Display */}
                        <div className="text-center py-2 space-y-1">
                            <h2 className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">{currentTime}</h2>
                            <p className="text-xs text-gray-400 font-mono">
                                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Clock In / Clock Out Action Button */}
                        <div className="pt-2">
                            {activeShift?.status === 'clocked_in' ? (
                                <button
                                    type="button"
                                    onClick={handleClockOut}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>🛑 CLOCK OUT OF SHIFT</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleClockIn}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>⏰ CLOCK IN TO SHIFT</span>
                                </button>
                            )}
                        </div>

                        {activeShift && activeShift.clock_in_at && (
                            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono text-gray-300">
                                <span>Shift Started At:</span>
                                <span className="font-bold text-purple-300">
                                    {new Date(activeShift.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* KPI Metrics Cards */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* 1. Today's Hours Worked */}
                        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Today's Hours Worked</span>
                                <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                    ⏱️
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.today_hours.toFixed(2)} hrs</h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">Logged today by {user.name}</p>
                            </div>
                        </div>

                        {/* 2. Monthly Overtime */}
                        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-amber-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase font-mono text-amber-300">Monthly Overtime</span>
                                <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 text-lg border border-amber-500/20">
                                    ⏳
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-amber-300 font-mono tracking-tight">{metrics.monthly_overtime.toFixed(2)} hrs</h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">Logged beyond 8h shifts</p>
                            </div>
                        </div>

                        {/* 3. Active Staff On Duty */}
                        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase font-mono text-emerald-300">Active Staff On Duty</span>
                                <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-lg border border-emerald-500/20">
                                    👥
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-emerald-300 font-mono tracking-tight">{metrics.active_staff_count} Staff</h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">Currently clocked in</p>
                            </div>
                        </div>

                        {/* 4. Pending Leave Requests */}
                        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase font-mono text-indigo-300">Pending Leave Requests</span>
                                <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-lg border border-indigo-500/20">
                                    🌴
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.pending_leave_count} Requests</h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">Awaiting approval</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Live Staff Presence Cards */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>👥 Clinic Staff Live Presence Today</span>
                            </h3>
                            <p className="text-xs text-gray-400">Real-time attendance state of chiropractors and clinic staff.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {staffPresenceList.map((staff) => (
                            <div
                                key={staff.user_id}
                                className="glass-card rounded-3xl p-5 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-sm shrink-0">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                                            staff.status === 'clocked_in'
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                : staff.status === 'on_break'
                                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        }`}
                                    >
                                        {staff.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="font-extrabold text-white text-sm">{staff.name}</h4>
                                    <span className="text-[11px] text-purple-300 font-mono capitalize">{staff.role}</span>
                                </div>

                                <div className="pt-2 border-t border-white/10 text-[11px] font-mono space-y-1 text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Clock In:</span>
                                        <span className="text-white font-bold">{staff.clock_in_at || 'Not Clocked In'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Today Hours:</span>
                                        <span className="text-emerald-300 font-bold">{staff.working_hours.toFixed(1)} hrs</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timesheets & Working Hours Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>📋 Shift Timesheets & Working Hours</span>
                            </h3>
                            <p className="text-xs text-gray-400">Historical shift attendance log and overtime calculations.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                <tr>
                                    <th className="p-4">Staff Member</th>
                                    <th className="p-4">Clock In Time</th>
                                    <th className="p-4">Clock Out Time</th>
                                    <th className="p-4">Total Working Hours</th>
                                    <th className="p-4">Overtime Hours</th>
                                    <th className="p-4">Shift Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                                {timesheets.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No timesheet records logged.
                                        </td>
                                    </tr>
                                ) : (
                                    timesheets.data.map((ts) => (
                                        <tr key={ts.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 font-extrabold text-white">
                                                {ts.user?.name || 'Staff Member'}
                                            </td>
                                            <td className="p-4 text-purple-300">
                                                {ts.clock_in_at ? new Date(ts.clock_in_at).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {ts.clock_out_at ? new Date(ts.clock_out_at).toLocaleString() : 'Active Shift'}
                                            </td>
                                            <td className="p-4 font-black text-white text-sm">
                                                {ts.working_hours.toFixed(2)} hrs
                                            </td>
                                            <td className="p-4">
                                                {ts.overtime_hours > 0 ? (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                        +{ts.overtime_hours.toFixed(2)} hrs Overtime
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 text-[11px]">0.00 hrs</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                                    {ts.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leave Requests Hub */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>🌴 Staff Leave Requests & Applications ({leaveRequests.length})</span>
                            </h3>
                            <p className="text-xs text-gray-400">Review vacation, sick leave, and personal day applications.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                <tr>
                                    <th className="p-4">Staff Applicant</th>
                                    <th className="p-4">Leave Type</th>
                                    <th className="p-4">Date Range</th>
                                    <th className="p-4">Duration</th>
                                    <th className="p-4">Reason</th>
                                    <th className="p-4">Approval Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                {leaveRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                                            No leave applications submitted.
                                        </td>
                                    </tr>
                                ) : (
                                    leaveRequests.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 font-extrabold text-white">
                                                {leave.user?.name}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${getLeaveBadgeStyle(leave.leave_type)}`}>
                                                    {leave.leave_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-purple-300">
                                                {leave.start_date} → {leave.end_date}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-white">
                                                {leave.total_days} Days
                                            </td>
                                            <td className="p-4 max-w-xs truncate text-gray-300">
                                                {leave.reason}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                                                        leave.status === 'approved'
                                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                            : leave.status === 'rejected'
                                                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                    }`}
                                                >
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {leave.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateLeaveStatus(leave.id, 'approved')}
                                                            className="px-2.5 py-1 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 font-bold"
                                                        >
                                                            Approve ✓
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateLeaveStatus(leave.id, 'rejected')}
                                                            className="px-2.5 py-1 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 font-bold"
                                                        >
                                                            Reject ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-gray-500 font-mono">
                                                        Reviewed by {leave.approver?.name || 'Admin'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Request Leave Modal */}
            {isLeaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>🌴 Submit Leave Application</span>
                            </h3>
                            <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleLeaveSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Leave Category *</label>
                                <select
                                    value={leaveForm.data.leave_type}
                                    onChange={(e) => leaveForm.setData('leave_type', e.target.value as any)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs capitalize"
                                >
                                    <option value="vacation">Vacation Leave</option>
                                    <option value="sick_leave">Medical / Sick Leave</option>
                                    <option value="personal">Personal Time Off</option>
                                    <option value="maternity_paternity">Parental Leave</option>
                                    <option value="unpaid">Unpaid Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={leaveForm.data.start_date}
                                        onChange={(e) => leaveForm.setData('start_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={leaveForm.data.end_date}
                                        onChange={(e) => leaveForm.setData('end_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Reason for Application *</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Provide details or coverage arrangements during your leave..."
                                    value={leaveForm.data.reason}
                                    onChange={(e) => leaveForm.setData('reason', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
