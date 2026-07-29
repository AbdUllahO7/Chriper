import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export type AppointmentStatus =
    | 'scheduled'
    | 'checked_in'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export interface PatientOption {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
}

export interface DoctorOption {
    id: number;
    name: string;
    specialty: string;
    room_number: string;
}

export interface AppointmentRecord {
    id: number;
    patient_id: number;
    doctor_id: number;
    chiropractor_id: number | null;
    appointment_date: string;
    duration: number; // in minutes
    status: AppointmentStatus;
    service_type: string;
    notes: string | null;
    patient?: PatientOption;
    doctor?: DoctorOption;
}

interface IndexProps {
    appointments: AppointmentRecord[];
    patients: PatientOption[];
    doctors: DoctorOption[];
    selectedDate: string;
    viewMode: 'weekly' | 'daily' | 'list';
    statuses: AppointmentStatus[];
    durations: number[];
}

export default function Index({
    appointments,
    patients,
    doctors,
    selectedDate: initialSelectedDate,
    viewMode: initialViewMode,
    statuses,
    durations,
}: IndexProps) {
    const flash = (usePage().props as any).flash;
    const [viewMode, setViewMode] = useState<'weekly' | 'daily' | 'list'>(initialViewMode || 'weekly');
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        return new Date(d.setDate(diff));
    });
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<AppointmentRecord | null>(null);
    const [deletingAppointment, setDeletingAppointment] = useState<AppointmentRecord | null>(null);
    const [draggedApptId, setDraggedApptId] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Flash notification watcher
    useEffect(() => {
        if (flash?.message) {
            setToastMessage(flash.message);
            const timer = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Booking Form
    const bookForm = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:00',
        duration: 30,
        status: 'scheduled' as AppointmentStatus,
        service_type: 'Spinal Adjustment & Alignment',
        notes: '',
    });

    // Edit Form
    const editForm = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        appointment_date: '',
        appointment_time: '',
        duration: 30,
        status: 'scheduled' as AppointmentStatus,
        service_type: '',
        notes: '',
    });

    // Generate 7 days for current week (Mon – Sun)
    const getWeekDays = () => {
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays();
    const hoursSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; // 08:00 AM to 05:00 PM

    const handlePrevWeek = () => {
        const prev = new Date(currentWeekStart);
        prev.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(prev);
    };

    const handleNextWeek = () => {
        const next = new Date(currentWeekStart);
        next.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(next);
    };

    const handleToday = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        setCurrentWeekStart(new Date(d.setDate(diff)));
        setSelectedDay(new Date());
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, apptId: number) => {
        setDraggedApptId(apptId);
        e.dataTransfer.setData('text/plain', apptId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Enable drop
    };

    const handleDrop = (e: React.DragEvent, targetDate: Date, targetHour: number) => {
        e.preventDefault();
        if (!draggedApptId) return;

        const newDate = new Date(targetDate);
        newDate.setHours(targetHour, 0, 0, 0);

        // Format to ISO string for backend parsing
        const dateString = newDate.toISOString().replace('T', ' ').substring(0, 19);

        router.patch(
            route('appointments.reschedule', draggedApptId),
            { appointment_date: dateString },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDraggedApptId(null);
                },
            }
        );
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bookForm.post(route('appointments.store'), {
            onSuccess: () => {
                setIsBookModalOpen(false);
            },
        });
    };

    const openEditModal = (appt: AppointmentRecord) => {
        setEditingAppointment(appt);
        const d = new Date(appt.appointment_date);
        const datePart = d.toISOString().split('T')[0];
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        editForm.setData({
            patient_id: appt.patient_id,
            doctor_id: appt.doctor_id,
            appointment_date: datePart,
            appointment_time: `${hours}:${minutes}`,
            duration: appt.duration,
            status: appt.status,
            service_type: appt.service_type,
            notes: appt.notes || '',
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAppointment) return;

        editForm.put(route('appointments.update', editingAppointment.id), {
            onSuccess: () => {
                setEditingAppointment(null);
            },
        });
    };

    const confirmDeleteAppointment = () => {
        if (deletingAppointment) {
            router.delete(route('appointments.destroy', deletingAppointment.id));
        }
    };

    const getStatusBadge = (status: AppointmentStatus) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'checked_in':
                return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
            case 'in_progress':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'completed':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'no_show':
            default:
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        }
    };

    const formatStatusLabel = (status: AppointmentStatus) => {
        return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Filter appointments for cell (date & hour)
    const getApptsForSlot = (date: Date, hour: number) => {
        return appointments.filter((appt) => {
            const aDate = new Date(appt.appointment_date);
            return (
                aDate.getFullYear() === date.getFullYear() &&
                aDate.getMonth() === date.getMonth() &&
                aDate.getDate() === date.getDate() &&
                aDate.getHours() === hour
            );
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Appointment <span className="gradient-text">Scheduler</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Interactive calendar with drag & drop rescheduling, daily/weekly views, and live notifications.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsBookModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>+ Book Appointment</span>
                    </button>
                </div>
            }
        >
            <Head title="Appointment Scheduler" />

            {/* Notification Toast Alert */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 animate-bounce">
                    <div className="glass-card rounded-2xl px-5 py-3.5 border border-purple-500/40 shadow-2xl bg-purple-950/80 text-purple-200 text-sm font-semibold flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping"></span>
                        <span>🔔 {toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Calendar Controls Bar */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* View Switcher Tabs */}
                <div className="flex items-center gap-2 bg-[#0b0f19]/80 p-1.5 rounded-xl border border-white/10 w-full md:w-auto">
                    <button
                        onClick={() => setViewMode('weekly')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'weekly' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        📅 Weekly View
                    </button>
                    <button
                        onClick={() => setViewMode('daily')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'daily' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        📋 Daily View
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        📜 List View
                    </button>
                </div>

                {/* Week / Date Navigator */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToday}
                        className="px-3.5 py-2 rounded-xl glass-card text-xs font-semibold text-gray-300 hover:text-white border border-white/10"
                    >
                        Today
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 rounded-xl glass-card text-gray-300 hover:text-white border border-white/10"
                        >
                            ←
                        </button>
                        <span className="text-sm font-bold text-white px-2">
                            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                            {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 rounded-xl glass-card text-gray-300 hover:text-white border border-white/10"
                        >
                            →
                        </button>
                    </div>
                </div>

                {/* Status Legend Pills */}
                <div className="hidden lg:flex items-center gap-2 overflow-x-auto">
                    <span className="text-[11px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Scheduled</span>
                    <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">Checked In</span>
                    <span className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">In Progress</span>
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Completed</span>
                    <span className="text-[11px] font-bold text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Cancelled</span>
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">No Show</span>
                </div>
            </div>

            {/* WEEKLY DRAG & DROP CALENDAR VIEW */}
            {viewMode === 'weekly' && (
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left border-collapse">
                            {/* Days Header */}
                            <thead>
                                <tr className="bg-white/[0.03] border-b border-white/10 text-xs font-bold text-gray-400">
                                    <th className="p-4 w-20 text-center border-r border-white/5">Time</th>
                                    {weekDays.map((day, idx) => {
                                        const isToday = day.toDateString() === new Date().toDateString();
                                        return (
                                            <th
                                                key={idx}
                                                className={`p-4 text-center border-r border-white/5 last:border-r-0 ${
                                                    isToday ? 'bg-purple-600/20 text-purple-300' : ''
                                                }`}
                                            >
                                                <span className="block uppercase text-[10px] tracking-wider text-gray-400">
                                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </span>
                                                <span className="text-base font-black text-white">
                                                    {day.getDate()}
                                                </span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            {/* Time Slots Rows */}
                            <tbody className="divide-y divide-white/5">
                                {hoursSlots.map((hour) => (
                                    <tr key={hour} className="h-28">
                                        {/* Hour Label Column */}
                                        <td className="p-3 text-center border-r border-white/5 text-xs font-mono text-gray-400 align-top bg-white/[0.01]">
                                            {hour.toString().padStart(2, '0')}:00
                                        </td>

                                        {/* Day Cells for Drag & Drop */}
                                        {weekDays.map((day, dayIdx) => {
                                            const cellAppts = getApptsForSlot(day, hour);
                                            return (
                                                <td
                                                    key={dayIdx}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, day, hour)}
                                                    className="p-1.5 border-r border-white/5 last:border-r-0 align-top hover:bg-white/[0.02] transition-colors relative"
                                                >
                                                    <div className="space-y-1.5 min-h-[90px]">
                                                        {cellAppts.map((appt) => {
                                                            const patientName = appt.patient
                                                                ? `${appt.patient.first_name} ${appt.patient.last_name}`
                                                                : 'Patient';
                                                            const doctorName = appt.doctor?.name || 'Chiropractor';

                                                            return (
                                                                <div
                                                                    key={appt.id}
                                                                    draggable
                                                                    onDragStart={(e) => handleDragStart(e, appt.id)}
                                                                    onClick={() => openEditModal(appt)}
                                                                    className={`p-2 rounded-xl border text-xs cursor-grab active:cursor-grabbing shadow-md hover:scale-[1.02] transition-all group ${getStatusBadge(
                                                                        appt.status
                                                                    )}`}
                                                                >
                                                                    <div className="flex items-center justify-between font-bold text-white mb-0.5 truncate">
                                                                        <span className="truncate">{patientName}</span>
                                                                        <span className="text-[10px] opacity-80 shrink-0 font-mono">
                                                                            {appt.duration}m
                                                                        </span>
                                                                    </div>
                                                                    <span className="block text-[11px] opacity-90 truncate">
                                                                        {appt.service_type}
                                                                    </span>
                                                                    <div className="mt-1 flex items-center justify-between text-[10px] opacity-75">
                                                                        <span className="truncate">{doctorName}</span>
                                                                        <span className="font-bold uppercase tracking-wider">
                                                                            {appt.status.replace('_', ' ')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DAILY HOUR-BY-HOUR VIEW */}
            {viewMode === 'daily' && (
                <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl mb-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">Daily Timeline</h3>
                            <span className="text-xs text-purple-400">
                                {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <input
                            type="date"
                            value={selectedDay.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDay(new Date(e.target.value))}
                            className="bg-[#0b0f19] text-white text-xs rounded-xl px-3 py-2 border border-white/10 outline-none"
                        />
                    </div>

                    <div className="space-y-3">
                        {hoursSlots.map((hour) => {
                            const appts = getApptsForSlot(selectedDay, hour);
                            return (
                                <div key={hour} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 items-start">
                                    <div className="w-16 font-mono text-sm font-bold text-purple-400 shrink-0">
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {appts.length === 0 ? (
                                            <span className="text-xs text-gray-500 italic block py-1">No appointments scheduled for this slot.</span>
                                        ) : (
                                            appts.map((appt) => (
                                                <div
                                                    key={appt.id}
                                                    onClick={() => openEditModal(appt)}
                                                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-all ${getStatusBadge(appt.status)}`}
                                                >
                                                    <div>
                                                        <span className="font-bold text-white text-sm block">
                                                            {appt.patient?.first_name} {appt.patient?.last_name}
                                                        </span>
                                                        <span className="text-xs opacity-90 block mt-0.5">{appt.service_type}</span>
                                                        <span className="text-[11px] opacity-75 block font-mono">Doctor: {appt.doctor?.name} ({appt.doctor?.room_number})</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border">
                                                            {formatStatusLabel(appt.status)}
                                                        </span>
                                                        <span className="text-xs block text-gray-400 mt-1 font-mono">{appt.duration} minutes</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Chiropractor / Room</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Service & Duration</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No appointments found.
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-bold text-white">
                                                {appt.patient ? `${appt.patient.first_name} ${appt.patient.last_name}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-gray-200 block font-medium">{appt.doctor?.name || 'Chiropractor'}</span>
                                                <span className="text-[11px] text-purple-400 font-mono">{appt.doctor?.room_number}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {new Date(appt.appointment_date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-gray-200 block">{appt.service_type}</span>
                                                <span className="text-[11px] text-gray-400">{appt.duration} mins</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(appt.status)}`}>
                                                    {formatStatusLabel(appt.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(appt)}
                                                        className="px-3 py-1.5 rounded-lg bg-white/5 text-blue-300 hover:bg-blue-600/20 text-xs font-semibold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingAppointment(appt)}
                                                        className="px-3 py-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 text-xs font-semibold"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingAppointment}
                title="Cancel Appointment"
                message="Are you sure you want to remove/cancel this appointment session?"
                confirmText="Cancel Appointment"
                onConfirm={confirmDeleteAppointment}
                onClose={() => setDeletingAppointment(null)}
            />

            {/* Book Appointment Modal */}
            {isBookModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Book New Appointment</h3>
                            <button onClick={() => setIsBookModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Patient *</label>
                                <select
                                    value={bookForm.data.patient_id}
                                    onChange={(e) => bookForm.setData('patient_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Chiropractor / Doctor *</label>
                                <select
                                    value={bookForm.data.doctor_id}
                                    onChange={(e) => bookForm.setData('doctor_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                >
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} — {d.specialty} ({d.room_number})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={bookForm.data.appointment_date}
                                        onChange={(e) => bookForm.setData('appointment_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={bookForm.data.appointment_time}
                                        onChange={(e) => bookForm.setData('appointment_time', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Duration *</label>
                                    <select
                                        value={bookForm.data.duration}
                                        onChange={(e) => bookForm.setData('duration', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    >
                                        {durations.map((dur) => (
                                            <option key={dur} value={dur}>{dur} mins</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Service Type *</label>
                                <input
                                    type="text"
                                    required
                                    value={bookForm.data.service_type}
                                    onChange={(e) => bookForm.setData('service_type', e.target.value)}
                                    placeholder="e.g. Spinal Decompression"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                                <select
                                    value={bookForm.data.status}
                                    onChange={(e) => bookForm.setData('status', e.target.value as AppointmentStatus)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm capitalize"
                                >
                                    {statuses.map((st) => (
                                        <option key={st} value={st}>{formatStatusLabel(st)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Clinical Notes</label>
                                <textarea
                                    rows={2}
                                    value={bookForm.data.notes}
                                    onChange={(e) => bookForm.setData('notes', e.target.value)}
                                    placeholder="Special symptoms or care instructions..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsBookModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Book Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Appointment Modal */}
            {editingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Edit Appointment</h3>
                            <button onClick={() => setEditingAppointment(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Patient</label>
                                <select
                                    value={editForm.data.patient_id}
                                    onChange={(e) => editForm.setData('patient_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Doctor</label>
                                <select
                                    value={editForm.data.doctor_id}
                                    onChange={(e) => editForm.setData('doctor_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                >
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.data.appointment_date}
                                        onChange={(e) => editForm.setData('appointment_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={editForm.data.appointment_time}
                                        onChange={(e) => editForm.setData('appointment_time', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Duration</label>
                                    <select
                                        value={editForm.data.duration}
                                        onChange={(e) => editForm.setData('duration', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    >
                                        {durations.map((dur) => (
                                            <option key={dur} value={dur}>{dur} mins</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value as AppointmentStatus)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm capitalize font-bold"
                                >
                                    {statuses.map((st) => (
                                        <option key={st} value={st}>{formatStatusLabel(st)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingAppointment(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
