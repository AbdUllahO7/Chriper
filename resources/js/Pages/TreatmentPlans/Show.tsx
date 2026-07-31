import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { TreatmentPlanItem } from './Index';

interface ShowProps {
    treatmentPlan: TreatmentPlanItem;
}

export default function Show({ treatmentPlan }: ShowProps) {
    const [togglingSession, setTogglingSession] = useState<number | null>(null);

    const handleToggleSession = (sessionNumber: number) => {
        setTogglingSession(sessionNumber);
        router.post(
            route('treatment-plans.toggle-session', {
                treatment_plan: treatmentPlan.id,
                session_number: sessionNumber,
            }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingSession(null),
            }
        );
    };

    const getStatusClass = (status: TreatmentPlanItem['status']) => {
        if (status === 'completed') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        if (status === 'active') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        if (status === 'paused') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const weeksBreakdown = treatmentPlan.weeks_breakdown || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('treatment-plans.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Treatment Plans
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Treatment Plan <span className="gradient-text">Dossier</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Prescribed care schedule for {treatmentPlan.patient?.first_name} {treatmentPlan.patient?.last_name}.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Treatment Plan - ${treatmentPlan.title}`} />

            <div className="space-y-8">
                {/* Dossier Header Banner */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl ring-2 ring-white/10 shrink-0">
                            📋
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-extrabold text-white">{treatmentPlan.title}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusClass(treatmentPlan.status)}`}>
                                    {treatmentPlan.status}
                                </span>
                            </div>
                            <p className="text-xs text-purple-300 font-semibold">
                                Patient: {treatmentPlan.patient?.first_name} {treatmentPlan.patient?.last_name} ({treatmentPlan.patient?.email})
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                                Attending Chiropractor: {treatmentPlan.doctor?.name || 'Staff Chiropractor'} ({treatmentPlan.doctor?.specialty})
                            </p>
                            {treatmentPlan.description && (
                                <p className="text-xs text-gray-300 pt-2 italic max-w-2xl bg-black/30 p-3 rounded-xl border border-white/5">
                                    "{treatmentPlan.description}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Progress Metrics Overview Card */}
                    <div className="w-full lg:w-auto p-6 rounded-2xl glass-card border border-white/10 space-y-4 shrink-0 min-w-[260px]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                Plan Progress
                            </span>
                            <span className="text-2xl font-black font-mono text-white">
                                {treatmentPlan.completion_percentage}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                style={{ width: `${treatmentPlan.completion_percentage}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs font-mono">
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-gray-400 block text-[10px] uppercase">Completed</span>
                                <span className="text-emerald-300 font-extrabold text-sm">
                                    {treatmentPlan.completed_sessions} / {treatmentPlan.total_sessions}
                                </span>
                            </div>
                            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <span className="text-gray-400 block text-[10px] uppercase">Remaining</span>
                                <span className="text-purple-300 font-extrabold text-sm">
                                    {treatmentPlan.remaining_sessions} Left
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grouped Weekly Session Checklist */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>Weekly Sessions Checklist</span>
                                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    {weeksBreakdown.length} Weeks Scheduled
                                </span>
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Check off completed chiropractic sessions for each prescribed week.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {weeksBreakdown.map((week) => (
                            <div
                                key={week.week_number}
                                className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4"
                            >
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <h4 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                                        <span>🗓️ {week.title}</span>
                                    </h4>
                                    <span className="text-xs font-mono text-gray-400">
                                        {week.sessions.filter((s) => s.completed).length} / {week.sessions.length} done
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {week.sessions.map((session) => {
                                        const isToggling = togglingSession === session.session_number;

                                        return (
                                            <div
                                                key={session.session_number}
                                                onClick={() => !isToggling && handleToggleSession(session.session_number)}
                                                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                                                    session.completed
                                                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                                                        : 'bg-slate-900/60 border-white/10 hover:border-purple-500/40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Custom Checkbox Pill */}
                                                    <div
                                                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                                                            session.completed
                                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 ring-2 ring-emerald-500/40'
                                                                : 'bg-white/5 border border-white/20 text-transparent'
                                                        }`}
                                                    >
                                                        ✓
                                                    </div>

                                                    <div>
                                                        <span
                                                            className={`text-sm font-extrabold block ${
                                                                session.completed ? 'text-emerald-300 line-through' : 'text-white'
                                                            }`}
                                                        >
                                                            Session {session.session_number}
                                                        </span>
                                                        <span className="text-xs text-gray-400 block font-mono">
                                                            {session.completed
                                                                ? `Completed on ${new Date(session.completed_at!).toLocaleDateString()}`
                                                                : 'Scheduled / Pending'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isToggling}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                                                        session.completed
                                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                                            : 'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30'
                                                    }`}
                                                >
                                                    {isToggling ? 'Updating...' : session.completed ? '✓ Completed' : '□ Mark Done'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
