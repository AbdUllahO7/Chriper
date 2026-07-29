import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnalyticsChart from '@/Components/Dashboard/AnalyticsChart';
import MetricCard, { MetricCardData } from '@/Components/Dashboard/MetricCard';
import ScheduleOverview from '@/Components/Dashboard/ScheduleOverview';
import RoleShortcuts from '@/Components/Dashboard/RoleShortcuts';
import { Head, usePage } from '@inertiajs/react';

interface DashboardProps {
    cards: {
        todaysAppointments: MetricCardData;
        activePatients: MetricCardData;
        totalPatients: MetricCardData;
        monthlyRevenue: MetricCardData;
        pendingPayments: MetricCardData;
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

            {/* Dynamic Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
                <MetricCard
                    card={cards.todaysAppointments}
                    colorScheme="purple"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                />

                <MetricCard
                    card={cards.activePatients}
                    colorScheme="blue"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                />

                <MetricCard
                    card={cards.totalPatients}
                    colorScheme="indigo"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />

                <MetricCard
                    card={cards.monthlyRevenue}
                    colorScheme="emerald"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <MetricCard
                    card={cards.pendingPayments}
                    colorScheme="amber"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                />
            </div>

            {/* Dynamic Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 h-[340px]">
                    <AnalyticsChart
                        type="bar"
                        data={weeklyAppointments}
                        title="Weekly Appointments"
                        subtitle="Completed vs Scheduled (Mon – Sun)"
                    />
                </div>

                <div className="lg:col-span-1 h-[340px]">
                    <AnalyticsChart
                        type="line"
                        data={monthlyIncome}
                        title="Monthly Income"
                        subtitle="Revenue vs Target ($USD)"
                    />
                </div>

                <div className="lg:col-span-1 h-[340px]">
                    <AnalyticsChart
                        type="line"
                        data={newPatients}
                        title="New Patients Growth"
                        subtitle="Monthly registrations (Jan – Jul)"
                    />
                </div>
            </div>

            {/* Dynamic Schedule Overview & Role Shortcuts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ScheduleOverview />
                </div>
                <div className="lg:col-span-1">
                    <RoleShortcuts />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
