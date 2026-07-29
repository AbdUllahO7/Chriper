import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnalyticsChart from '@/Components/Dashboard/AnalyticsChart';
import { Head, usePage } from '@inertiajs/react';

interface MetricCard {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'warning';
    description: string;
}

interface DashboardProps {
    cards: {
        todaysAppointments: MetricCard;
        activePatients: MetricCard;
        totalPatients: MetricCard;
        monthlyRevenue: MetricCard;
        pendingPayments: MetricCard;
    };
    weeklyAppointments: { labels: string[]; datasets: any[] };
    monthlyIncome: { labels: string[]; datasets: any[] };
    newPatients: { labels: string[]; datasets: any[] };
}

export default function Dashboard({
    cards,
    weeklyAppointments,
    monthlyIncome,
    newPatients,
}: DashboardProps) {
    const user = usePage().props.auth.user;

    const renderMetricCard = (
        card: MetricCard,
        iconSvg: React.ReactNode,
        accentColorClass: string,
        glowClass: string
    ) => {
        return (
            <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl hover:border-purple-500/30 transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {card.title}
                    </span>
                    <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${accentColorClass} ${glowClass}`}
                    >
                        {iconSvg}
                    </div>
                </div>

                <div className="mt-1">
                    <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                            {card.value}
                        </span>
                        <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                card.trend === 'warning'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                        >
                            {card.change}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{card.description}</p>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Clinic <span className="gradient-text">Dashboard</span>
                            </h1>
                            <span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {user.role}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Real-time metrics for appointments, patient growth, and financial revenue.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors">
                            Export Report
                        </button>
                        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 transition-all">
                            + Book Appointment
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Clinic Dashboard" />

            {/* Step 3 — 5 KPI Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                {/* 1. Today's Appointments */}
                {renderMetricCard(
                    cards.todaysAppointments,
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>,
                    'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    'shadow-purple-500/10'
                )}

                {/* 2. Active Patients */}
                {renderMetricCard(
                    cards.activePatients,
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>,
                    'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    'shadow-blue-500/10'
                )}

                {/* 3. Total Patients */}
                {renderMetricCard(
                    cards.totalPatients,
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>,
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    'shadow-indigo-500/10'
                )}

                {/* 4. Monthly Revenue */}
                {renderMetricCard(
                    cards.monthlyRevenue,
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>,
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    'shadow-emerald-500/10'
                )}

                {/* 5. Pending Payments */}
                {renderMetricCard(
                    cards.pendingPayments,
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>,
                    'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    'shadow-amber-500/10'
                )}
            </div>

            {/* Step 3 — Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Weekly Appointments (Bar Chart) */}
                <div className="lg:col-span-1 h-[340px]">
                    <AnalyticsChart
                        type="bar"
                        data={weeklyAppointments}
                        title="Weekly Appointments"
                        subtitle="Completed vs Scheduled (Mon – Sun)"
                    />
                </div>

                {/* 2. Monthly Income (Area Line Chart) */}
                <div className="lg:col-span-1 h-[340px]">
                    <AnalyticsChart
                        type="line"
                        data={monthlyIncome}
                        title="Monthly Income"
                        subtitle="Revenue vs Target ($USD)"
                    />
                </div>

                {/* 3. New Patients (Line Chart) */}
                <div className="lg:col-span-1 h-[340px]">
                    <AnalyticsChart
                        type="line"
                        data={newPatients}
                        title="New Patients Growth"
                        subtitle="Monthly registrations (Jan – Jul)"
                    />
                </div>
            </div>

            {/* Quick Actions & Recent Schedule Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white">Today's Schedule Overview</h3>
                        <span className="text-xs text-purple-400 font-mono">18 total appointments</span>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-sm">
                                    09:00
                                </div>
                                <div>
                                    <span className="font-semibold text-white text-sm block">Robert Martinez</span>
                                    <span className="text-xs text-gray-400">Spinal Adjustment & Decompression</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                                Completed
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-sm">
                                    10:30
                                </div>
                                <div>
                                    <span className="font-semibold text-white text-sm block">Emily Watson</span>
                                    <span className="text-xs text-gray-400">Initial Chiropractic Consultation</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                                In Progress
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-sm">
                                    14:00
                                </div>
                                <div>
                                    <span className="font-semibold text-white text-sm block">Michael Chang</span>
                                    <span className="text-xs text-gray-400">Postural Rehab & Physical Therapy</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                                Scheduled
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
                    <h3 className="text-base font-bold text-white">Role Shortcuts</h3>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/20">
                            <span className="font-bold text-purple-300 text-sm block">🛡️ Admin Actions</span>
                            <p className="text-xs text-gray-400 mt-1">Manage staff roles, inspect permissions & user logs.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-blue-500/20">
                            <span className="font-bold text-blue-300 text-sm block">📋 Receptionist Desk</span>
                            <p className="text-xs text-gray-400 mt-1">Process patient check-ins and collect pending payments.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/20">
                            <span className="font-bold text-emerald-300 text-sm block">🩺 Chiropractor Suite</span>
                            <p className="text-xs text-gray-400 mt-1">Access patient care plans, write clinical SOAP notes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
