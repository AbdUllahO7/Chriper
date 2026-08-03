import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export interface DoctorKpi {
    id: number;
    name: string;
    specialty: string;
    completed_visits: number;
    cancellation_rate: number;
    no_show_rate: number;
    revenue: number;
    arpp: number;
}

export interface TrendItem {
    month: string;
    new_patients: number;
    cancellation_rate: number;
    no_show_rate: number;
    revenue: number;
}

interface IndexProps {
    metrics: {
        new_patients_this_month: number;
        new_patient_change: number;
        returning_patient_rate: number;
        avg_visits_per_patient: number;
        cancellation_rate: number;
        no_show_rate: number;
        avg_revenue_per_patient: number;
        total_patients: number;
        total_appointments: number;
        total_revenue: number;
    };
    statusBreakdown: {
        completed: number;
        scheduled: number;
        cancelled: number;
        no_show: number;
    };
    historicalTrend: TrendItem[];
    doctorKpis: DoctorKpi[];
}

export default function Index({
    metrics,
    statusBreakdown,
    historicalTrend,
    doctorKpis,
}: IndexProps) {
    const maxNewPatients = Math.max(...historicalTrend.map((t) => t.new_patients), 10);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Executive Practice <span className="gradient-text">KPI Dashboard</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Key operational, clinical, and financial performance metrics for practice growth.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('reports.index')}
                            className="px-4 py-2.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 font-extrabold text-xs transition-all flex items-center gap-2"
                        >
                            <span>📈 Reports & Analytics</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Executive KPI Dashboard" />

            <div className="space-y-8">
                {/* 6 Core Executive KPI Hero Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 1. New Patients This Month */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">New Patients This Month</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                👥
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                                {metrics.new_patients_this_month} <span className="text-xs text-gray-400 font-normal">Patients</span>
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono">
                                <span className={`font-bold ${metrics.new_patient_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {metrics.new_patient_change >= 0 ? `▲ +${metrics.new_patient_change}%` : `▼ ${metrics.new_patient_change}%`}
                                </span>
                                <span className="text-gray-400">vs last month</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Returning Patient Rate */}
                    <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-emerald-300">Returning Patient Rate</span>
                            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-lg border border-emerald-500/20">
                                🔄
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                                {metrics.returning_patient_rate}%
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Patients with 2+ treatment sessions</p>
                        </div>
                    </div>

                    {/* 3. Average Visits Per Patient */}
                    <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-indigo-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-indigo-300">Average Visits / Patient</span>
                            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-lg border border-indigo-500/20">
                                🦴
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-indigo-300 font-mono tracking-tight">
                                {metrics.avg_visits_per_patient} <span className="text-xs text-gray-400 font-normal">Visits</span>
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Completed visits frequency</p>
                        </div>
                    </div>

                    {/* 4. Cancellation Rate */}
                    <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-amber-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-amber-300">Cancellation Rate</span>
                            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 text-lg border border-amber-500/20">
                                ❌
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-amber-300 font-mono tracking-tight">
                                {metrics.cancellation_rate}%
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Pre-appointment cancellations</p>
                        </div>
                    </div>

                    {/* 5. No-Show Rate */}
                    <div className="glass-card rounded-3xl p-6 border border-red-500/30 bg-red-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-red-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-red-300">No-Show Rate</span>
                            <span className="p-2.5 rounded-2xl bg-red-500/10 text-red-400 text-lg border border-red-500/20">
                                ⚠️
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-red-300 font-mono tracking-tight">
                                {metrics.no_show_rate}%
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Missed visits without notice</p>
                        </div>
                    </div>

                    {/* 6. Average Revenue Per Patient (ARPP) */}
                    <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-purple-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Avg Revenue / Patient (ARPP)</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                💵
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-purple-300 font-mono tracking-tight">
                                ${metrics.avg_revenue_per_patient.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Lifetime patient revenue yield</p>
                        </div>
                    </div>
                </div>

                {/* Historical Patient Acquisition & Reliability Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 6-Month New Patient Growth Bar Chart */}
                    <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    <span>📈 Monthly Patient Acquisition Growth</span>
                                </h3>
                                <p className="text-xs text-gray-400">New patient registrations over the past 6 calendar months.</p>
                            </div>
                        </div>

                        <div className="h-48 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-white/10">
                            {historicalTrend.map((item, idx) => {
                                const heightPct = maxNewPatients > 0
                                    ? Math.max(20, Math.round((item.new_patients / maxNewPatients) * 100))
                                    : 20;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <span className="text-[11px] font-mono text-purple-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.new_patients} New
                                        </span>
                                        <div
                                            className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-purple-600 to-indigo-500 group-hover:from-purple-500 group-hover:to-indigo-400 transition-all shadow-lg shadow-purple-600/30"
                                            style={{ height: `${heightPct}%` }}
                                        ></div>
                                        <span className="text-[11px] font-mono text-gray-400 font-bold block truncate">
                                            {item.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Appointment Reliability Breakdown */}
                    <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>🎯 Appointment Reliability Breakdown</span>
                            </h3>
                            <p className="text-xs text-gray-400">Distribution of completed, cancelled, and no-show visits.</p>
                        </div>

                        <div className="space-y-4 font-mono">
                            {/* Completed */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                                        <span>✅ Completed Visits</span>
                                    </span>
                                    <span className="text-emerald-300 font-bold">{statusBreakdown.completed} Visits</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{
                                            width: `${metrics.total_appointments > 0 ? (statusBreakdown.completed / metrics.total_appointments) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Scheduled */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                                        <span>📅 Upcoming Scheduled</span>
                                    </span>
                                    <span className="text-purple-300 font-bold">{statusBreakdown.scheduled} Visits</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-purple-500"
                                        style={{
                                            width: `${metrics.total_appointments > 0 ? (statusBreakdown.scheduled / metrics.total_appointments) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Cancelled */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                                        <span>❌ Cancelled</span>
                                    </span>
                                    <span className="text-amber-300 font-bold">{statusBreakdown.cancelled} ({metrics.cancellation_rate}%)</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                                    <div className="h-full bg-amber-500" style={{ width: `${metrics.cancellation_rate}%` }}></div>
                                </div>
                            </div>

                            {/* No-Show */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                                        <span>⚠️ No-Show Missed</span>
                                    </span>
                                    <span className="text-red-300 font-bold">{statusBreakdown.no_show} ({metrics.no_show_rate}%)</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                                    <div className="h-full bg-red-500" style={{ width: `${metrics.no_show_rate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chiropractor Performance KPI Leaderboard Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>🩺 Chiropractor Performance KPI Leaderboard</span>
                            </h3>
                            <p className="text-xs text-gray-400">Doctor visit counts, cancellation rates, no-show rates, and revenue yield per patient.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                <tr>
                                    <th className="p-4">Doctor Name</th>
                                    <th className="p-4">Specialty</th>
                                    <th className="p-4">Completed Visits</th>
                                    <th className="p-4">Cancellation Rate</th>
                                    <th className="p-4">No-Show Rate</th>
                                    <th className="p-4">Total Revenue</th>
                                    <th className="p-4 text-right">Avg Revenue / Patient (ARPP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                                {doctorKpis.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            No doctor performance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    doctorKpis.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 font-extrabold text-white">
                                                {doc.name}
                                            </td>
                                            <td className="p-4 text-purple-300 font-sans">
                                                {doc.specialty}
                                            </td>
                                            <td className="p-4 font-black text-white text-sm">
                                                {doc.completed_visits} Visits
                                            </td>
                                            <td className="p-4 font-bold text-amber-300">
                                                {doc.cancellation_rate}%
                                            </td>
                                            <td className="p-4 font-bold text-red-300">
                                                {doc.no_show_rate}%
                                            </td>
                                            <td className="p-4 font-extrabold text-white">
                                                ${doc.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-right font-extrabold text-purple-300">
                                                ${doc.arpp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
