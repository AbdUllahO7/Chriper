import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export interface TreatmentSessionItem {
    id: number;
    patient_id: number;
    doctor_id: number;
    session_date: string;
    treatment_type: string;
    adjustment_areas: string[] | null;
    notes: string | null;
    recommendations: string | null;
    patient?: { id: number; first_name: string; last_name: string; email: string };
    doctor?: { id: number; name: string; specialty: string; room_number: string };
}

interface IndexProps {
    treatmentSessions: TreatmentSessionItem[];
    patients: Array<{ id: number; first_name: string; last_name: string }>;
    doctors: Array<{ id: number; name: string; specialty: string }>;
    predefinedAdjustmentAreas: string[];
    filters: { search: string; patient_id: string };
}

export default function Index({
    treatmentSessions,
    patients,
    doctors,
    predefinedAdjustmentAreas,
    filters,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [patientFilter, setPatientFilter] = useState(filters.patient_id || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingSession, setDeletingSession] = useState<TreatmentSessionItem | null>(null);

    // Form
    const createForm = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        session_date: new Date().toISOString().substring(0, 16),
        treatment_type: 'Spinal Adjustment & Decompression',
        adjustment_areas: [] as string[],
        notes: '',
        recommendations: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('treatment-sessions.index'), { search, patient_id: patientFilter }, { preserveState: true });
    };

    const handlePatientFilterChange = (pid: string) => {
        setPatientFilter(pid);
        router.get(route('treatment-sessions.index'), { search, patient_id: pid }, { preserveState: true });
    };

    const handleAreaCheckboxToggle = (area: string) => {
        const current = createForm.data.adjustment_areas;
        if (current.includes(area)) {
            createForm.setData(
                'adjustment_areas',
                current.filter((a) => a !== area)
            );
        } else {
            createForm.setData('adjustment_areas', [...current, area]);
        }
    };

    const handleCreateSession = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('treatment-sessions.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const confirmDeleteSession = () => {
        if (deletingSession) {
            router.delete(route('treatment-sessions.destroy', deletingSession.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Treatment <span className="gradient-text">Sessions</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Chiropractic adjustments, spinal region tagging, clinical notes, and post-session recommendations.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>+ Log Treatment Session</span>
                    </button>
                </div>
            }
        >
            <Head title="Treatment Sessions" />

            {/* Search & Filter Toolbar */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by treatment type, notes, or patient..."
                        className="w-full bg-[#0b0f19]/80 text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-purple-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={patientFilter}
                        onChange={(e) => handlePatientFilterChange(e.target.value)}
                        className="bg-[#0b0f19]/80 text-white text-xs font-semibold rounded-xl px-3 py-2.5 border border-white/10 focus:border-purple-500 outline-none"
                    >
                        <option value="">All Patients</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Treatment Sessions Grid / Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Treatment Type</th>
                                <th className="px-6 py-4">Spinal Adjustment Areas</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Doctor</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {treatmentSessions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No treatment sessions logged yet.
                                    </td>
                                </tr>
                            ) : (
                                treatmentSessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('treatment-sessions.show', session.id)}
                                                className="font-bold text-white hover:text-purple-300 transition-colors block text-sm"
                                            >
                                                {session.patient ? `${session.patient.first_name} ${session.patient.last_name}` : 'N/A'}
                                            </Link>
                                            <span className="text-xs text-gray-400">{session.patient?.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-purple-300 text-xs block">
                                                {session.treatment_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {session.adjustment_areas && session.adjustment_areas.length > 0 ? (
                                                    session.adjustment_areas.map((area, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 rounded bg-purple-500/10 text-[11px] font-mono text-purple-200 border border-purple-500/20"
                                                        >
                                                            {area}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500">General Spine</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-300">
                                            {new Date(session.session_date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-300">
                                            {session.doctor?.name || 'Staff Chiropractor'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('treatment-sessions.show', session.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-purple-300 hover:bg-purple-600/20 text-xs font-semibold transition-colors"
                                                >
                                                    View Session
                                                </Link>
                                                <button
                                                    onClick={() => setDeletingSession(session)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                                                >
                                                    Delete
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

            {/* Custom Confirm Modal for Session Deletion */}
            <ConfirmModal
                isOpen={!!deletingSession}
                title="Delete Treatment Session"
                message="Are you sure you want to delete this treatment session record?"
                confirmText="Delete Session"
                onConfirm={confirmDeleteSession}
                onClose={() => setDeletingSession(null)}
            />

            {/* Log Treatment Session Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Log Chiropractic Treatment Session</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Select Patient *</label>
                                    <select
                                        value={createForm.data.patient_id}
                                        onChange={(e) => createForm.setData('patient_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    >
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Attending Doctor *</label>
                                    <select
                                        value={createForm.data.doctor_id}
                                        onChange={(e) => createForm.setData('doctor_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    >
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Session Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={createForm.data.session_date}
                                        onChange={(e) => createForm.setData('session_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Treatment Type *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.treatment_type}
                                        onChange={(e) => createForm.setData('treatment_type', e.target.value)}
                                        placeholder="e.g. Lumbar Decompression & Alignment"
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {/* Spinal Adjustment Areas Checkboxes */}
                            <div>
                                <label className="block text-xs font-bold text-purple-300 mb-2">
                                    Spinal Adjustment Regions (Check all applied)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/10 max-h-44 overflow-y-auto">
                                    {predefinedAdjustmentAreas.map((area) => {
                                        const isChecked = createForm.data.adjustment_areas.includes(area);
                                        return (
                                            <label
                                                key={area}
                                                className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                                                    isChecked
                                                        ? 'bg-purple-600/20 text-purple-200 border-purple-500/40'
                                                        : 'text-gray-400 border-white/5 hover:bg-white/5'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleAreaCheckboxToggle(area)}
                                                    className="rounded bg-[#0b0f19] border-white/20 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span>{area}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Clinical Session Notes (SOAP)</label>
                                <textarea
                                    rows={3}
                                    value={createForm.data.notes}
                                    onChange={(e) => createForm.setData('notes', e.target.value)}
                                    placeholder="Adjustments performed, patient posture response..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Patient Home Care Recommendations</label>
                                <textarea
                                    rows={3}
                                    value={createForm.data.recommendations}
                                    onChange={(e) => createForm.setData('recommendations', e.target.value)}
                                    placeholder="e.g. Ice 15 mins daily, posture exercises..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                                >
                                    Save Session Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
