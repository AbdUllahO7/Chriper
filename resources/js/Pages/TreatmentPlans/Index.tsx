import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export interface TreatmentPlanItem {
    id: number;
    patient_id: number;
    doctor_id: number;
    title: string;
    description: string | null;
    total_sessions: number;
    completed_sessions: number;
    frequency_per_week: number;
    start_date: string;
    target_end_date: string | null;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    completion_percentage: number;
    remaining_sessions: number;
    patient?: { id: number; first_name: string; last_name: string; email: string };
    doctor?: { id: number; name: string; specialty: string };
    weeks_breakdown?: Array<{
        week_number: number;
        title: string;
        sessions: Array<{
            session_number: number;
            title: string;
            completed: boolean;
            completed_at: string | null;
            notes: string | null;
        }>;
    }>;
}

interface IndexProps {
    treatmentPlans: {
        data: TreatmentPlanItem[];
        links: any[];
    };
    patients: Array<{ id: number; first_name: string; last_name: string }>;
    doctors: Array<{ id: number; name: string; specialty: string }>;
    filters: { search: string; patient_id: string; status: string };
}

export default function Index({ treatmentPlans, patients, doctors, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingPlan, setDeletingPlan] = useState<TreatmentPlanItem | null>(null);

    const createForm = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        title: '',
        description: '',
        total_sessions: 8,
        frequency_per_week: 2,
        start_date: new Date().toISOString().split('T')[0],
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('treatment-plans.index'),
            { search, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleStatusFilterChange = (st: string) => {
        setStatusFilter(st);
        router.get(
            route('treatment-plans.index'),
            { search, status: st },
            { preserveState: true }
        );
    };

    const handleCreatePlan = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('treatment-plans.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const confirmDeletePlan = () => {
        if (deletingPlan) {
            router.delete(route('treatment-plans.destroy', deletingPlan.id));
        }
    };

    const getStatusClass = (status: TreatmentPlanItem['status']) => {
        if (status === 'completed') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        if (status === 'active') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        if (status === 'paused') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const calculatedWeeks = Math.ceil(
        (createForm.data.total_sessions || 1) / (createForm.data.frequency_per_week || 1)
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Chiropractic <span className="gradient-text">Treatment Plans</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Prescribe multi-week care programs, check off sessions, and track progress metrics.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                    >
                        <span>📋</span>
                        <span>Prescribe Treatment Plan</span>
                    </button>
                </div>
            }
        >
            <Head title="Chiropractic Treatment Plans" />

            <div className="space-y-6">
                {/* Search & Filter Toolbar */}
                <div className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search plan title or patient name..."
                            className="w-full bg-[#0b0f19] text-white rounded-xl px-4 py-2.5 border border-white/15 focus:border-purple-500 outline-none text-xs"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold text-xs hover:bg-purple-600/30 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    {/* Status Filter Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        {['', 'active', 'completed', 'paused'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilterChange(st)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                                    statusFilter === st
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                }`}
                            >
                                {st === '' ? 'All Plans' : st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Treatment Plans Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {treatmentPlans.data.length === 0 ? (
                        <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-white/10 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mx-auto border border-purple-500/20">
                                📋
                            </div>
                            <h3 className="text-lg font-bold text-white">No Treatment Plans Prescribed Yet</h3>
                            <p className="text-xs text-gray-400 max-w-md mx-auto">
                                Prescribe a multi-week treatment plan for your patients to schedule sessions, track completion percentage, and monitor care progress.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all inline-block mt-2"
                            >
                                Prescribe First Treatment Plan
                            </button>
                        </div>
                    ) : (
                        treatmentPlans.data.map((plan) => (
                            <div
                                key={plan.id}
                                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusClass(plan.status)}`}>
                                            {plan.status}
                                        </span>
                                        <span className="text-xs font-mono text-gray-400">
                                            {plan.frequency_per_week} sessions / week
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                            {plan.title}
                                        </h3>
                                        <p className="text-xs text-purple-400 font-semibold mt-0.5">
                                            Patient: {plan.patient?.first_name} {plan.patient?.last_name}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            Doctor: {plan.doctor?.name || 'Staff Chiropractor'}
                                        </p>
                                    </div>

                                    {/* Progress Bar & Percentage Gauge */}
                                    <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-gray-300">Progress</span>
                                            <span className="text-purple-300 font-mono font-extrabold">
                                                {plan.completion_percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                                style={{ width: `${plan.completion_percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                                            <span>✓ {plan.completed_sessions} of {plan.total_sessions} Sessions</span>
                                            <span>{plan.remaining_sessions} Left</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action Buttons */}
                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <span className="text-[10px] text-gray-500 font-mono">
                                        Start: {new Date(plan.start_date).toLocaleDateString()}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setDeletingPlan(plan)}
                                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 text-xs font-bold transition-colors"
                                        >
                                            Delete
                                        </button>
                                        <Link
                                            href={route('treatment-plans.show', plan.id)}
                                            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-extrabold text-xs border border-purple-500/30 transition-all"
                                        >
                                            Open Plan Checklist →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deletingPlan}
                title="Delete Treatment Plan"
                message="Are you sure you want to delete this treatment plan? This action cannot be undone."
                confirmText="Delete Plan"
                onConfirm={confirmDeletePlan}
                onClose={() => setDeletingPlan(null)}
            />

            {/* Prescribe Treatment Plan Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>📋 Prescribe Treatment Plan</span>
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlan} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">
                                        Select Patient *
                                    </label>
                                    <select
                                        value={createForm.data.patient_id}
                                        onChange={(e) => createForm.setData('patient_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                    >
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.first_name} {p.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">
                                        Attending Chiropractor *
                                    </label>
                                    <select
                                        value={createForm.data.doctor_id}
                                        onChange={(e) => createForm.setData('doctor_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                    >
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.specialty})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Plan Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="e.g. Lumbar Decompression & Postural Alignment Plan"
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Total Sessions *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        required
                                        value={createForm.data.total_sessions}
                                        onChange={(e) => createForm.setData('total_sessions', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Sessions / Week *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="7"
                                        required
                                        value={createForm.data.frequency_per_week}
                                        onChange={(e) => createForm.setData('frequency_per_week', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.start_date}
                                        onChange={(e) => createForm.setData('start_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                    />
                                </div>
                            </div>

                            {/* Schedule Summary Preview Banner */}
                            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between font-mono">
                                <span>🗓️ Schedule Duration:</span>
                                <span className="font-extrabold text-white">
                                    {calculatedWeeks} {calculatedWeeks === 1 ? 'Week' : 'Weeks'} ({createForm.data.total_sessions} sessions)
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Clinical Goals & Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    placeholder="Goals: Reduce L4-L5 lumbar pain, improve spinal range of motion..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
                                >
                                    Save Treatment Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
