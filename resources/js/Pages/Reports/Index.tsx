import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export type ReportTab = 'revenue' | 'appointments' | 'patients' | 'performance' | 'outstanding';
export type DateRange = 'this_month' | 'last_month' | 'this_year' | 'all_time';

interface RevenueReportData {
    totalInvoiced: number;
    totalCollected: number;
    balanceDue: number;
    paymentMethods: {
        card: number;
        cash: number;
        insurance: number;
    };
}

interface AppointmentsReportData {
    total: number;
    completed: number;
    scheduled: number;
    in_progress: number;
    checked_in: number;
    cancelled: number;
    no_show: number;
    list: Array<{
        id: number;
        appointment_date: string;
        service_type: string;
        status: string;
        patient?: { first_name: string; last_name: string };
        chiropractor?: { name: string };
    }>;
}

interface PatientsReportData {
    totalPatients: number;
    newPatients: number;
    activePatients: number;
    inactivePatients: number;
    insuranceBreakdown: Array<{ insurance: string; count: number }>;
    recentList: Array<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        status: string;
        created_at: string;
    }>;
}

interface PerformanceDoctorItem {
    id: number;
    name: string;
    specialty: string;
    room_number: string;
    completed_visits: number;
    total_appointments: number;
    completion_rate: number;
    revenue_generated: number;
}

interface OutstandingInvoiceItem {
    id: number;
    invoice_number: string;
    patient_name: string;
    patient_phone: string;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    issue_date: string;
    due_date: string;
    days_past_due: number;
    status: string;
}

interface IndexProps {
    revenueReport: RevenueReportData;
    appointmentsReport: AppointmentsReportData;
    patientsReport: PatientsReportData;
    performanceReport: PerformanceDoctorItem[];
    outstandingReport: OutstandingInvoiceItem[];
    filters: { range: DateRange; tab: ReportTab };
}

export default function Index({
    revenueReport,
    appointmentsReport,
    patientsReport,
    performanceReport,
    outstandingReport,
    filters,
}: IndexProps) {
    const [activeTab, setActiveTab] = useState<ReportTab>(filters.tab || 'revenue');
    const [dateRange, setDateRange] = useState<DateRange>(filters.range || 'this_month');

    const handleRangeChange = (range: DateRange) => {
        setDateRange(range);
        router.get(route('reports.index'), { range, tab: activeTab }, { preserveState: true });
    };

    const handleTabChange = (tab: ReportTab) => {
        setActiveTab(tab);
        router.get(route('reports.index'), { range: dateRange, tab }, { preserveState: true });
    };

    const handleExportCsv = () => {
        window.location.href = route('reports.export.csv', { type: activeTab, range: dateRange });
    };

    const handleExportPdf = () => {
        window.open(route('reports.export.pdf', { tab: activeTab, range: dateRange }), '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Clinical Analytics & <span className="gradient-text">Reports</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Comprehensive financial revenue, appointment volume, patient metrics, doctor performance & aging payments.
                        </p>
                    </div>

                    {/* Export Toolbar */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCsv}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-bold text-xs transition-all shadow-md flex items-center gap-2"
                        >
                            <span>📊 Export Excel (.csv)</span>
                        </button>
                        <button
                            onClick={handleExportPdf}
                            className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-bold text-xs transition-all shadow-md flex items-center gap-2"
                        >
                            <span>📄 Export to PDF</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Clinical Analytics & Reports" />

            {/* Date Range Toolbar */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                    <span className="text-xs text-gray-400 font-bold uppercase mr-2">Filter Timeframe:</span>
                    {[
                        { key: 'this_month', label: 'This Month' },
                        { key: 'last_month', label: 'Last Month' },
                        { key: 'this_year', label: 'This Year' },
                        { key: 'all_time', label: 'All Time' },
                    ].map((r) => (
                        <button
                            key={r.key}
                            onClick={() => handleRangeChange(r.key as DateRange)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                dateRange === r.key
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 5 Core Report Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto">
                <button
                    onClick={() => handleTabChange('revenue')}
                    className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                        activeTab === 'revenue'
                            ? 'border-purple-500 text-purple-300'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    💰 1. Revenue Report
                </button>
                <button
                    onClick={() => handleTabChange('appointments')}
                    className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                        activeTab === 'appointments'
                            ? 'border-purple-500 text-purple-300'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    📅 2. Appointments Report
                </button>
                <button
                    onClick={() => handleTabChange('patients')}
                    className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                        activeTab === 'patients'
                            ? 'border-purple-500 text-purple-300'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    👥 3. Patients Report
                </button>
                <button
                    onClick={() => handleTabChange('performance')}
                    className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                        activeTab === 'performance'
                            ? 'border-purple-500 text-purple-300'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    🩺 4. Doctor Performance
                </button>
                <button
                    onClick={() => handleTabChange('outstanding')}
                    className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                        activeTab === 'outstanding'
                            ? 'border-purple-500 text-purple-300'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    ⚠️ 5. Outstanding Payments
                </button>
            </div>

            {/* TAB 1: REVENUE REPORT */}
            {activeTab === 'revenue' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="glass-card rounded-3xl p-6 border border-white/10">
                            <span className="text-xs text-gray-400 uppercase font-semibold">Total Invoiced</span>
                            <span className="text-3xl font-extrabold text-white block mt-1">
                                ${revenueReport.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30">
                            <span className="text-xs text-emerald-400 uppercase font-semibold">Total Revenue Collected</span>
                            <span className="text-3xl font-extrabold text-emerald-300 block mt-1">
                                ${revenueReport.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="glass-card rounded-3xl p-6 border border-amber-500/30">
                            <span className="text-xs text-amber-400 uppercase font-semibold">Outstanding Balance</span>
                            <span className="text-3xl font-extrabold text-amber-300 block mt-1">
                                ${revenueReport.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method Distribution */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
                        <h3 className="text-lg font-bold text-white">Payment Method Breakdown (Cash, Card, Insurance)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                                <span className="text-sm font-bold text-gray-300 flex items-center gap-2">💳 Credit / Debit Card</span>
                                <span className="text-2xl font-extrabold text-purple-300 font-mono block">
                                    ${revenueReport.paymentMethods.card.toFixed(2)}
                                </span>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                                <span className="text-sm font-bold text-gray-300 flex items-center gap-2">💵 Cash Payment</span>
                                <span className="text-2xl font-extrabold text-emerald-300 font-mono block">
                                    ${revenueReport.paymentMethods.cash.toFixed(2)}
                                </span>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                                <span className="text-sm font-bold text-gray-300 flex items-center gap-2">🏥 Health Insurance Claim</span>
                                <span className="text-2xl font-extrabold text-blue-300 font-mono block">
                                    ${revenueReport.paymentMethods.insurance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: APPOINTMENTS REPORT */}
            {activeTab === 'appointments' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="glass-card rounded-3xl p-6 border border-white/10">
                            <span className="text-xs text-gray-400 uppercase font-semibold">Total Appointments</span>
                            <span className="text-3xl font-extrabold text-white block mt-1">{appointmentsReport.total}</span>
                        </div>
                        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30">
                            <span className="text-xs text-emerald-400 uppercase font-semibold">Completed Visits</span>
                            <span className="text-3xl font-extrabold text-emerald-300 block mt-1">{appointmentsReport.completed}</span>
                        </div>
                        <div className="glass-card rounded-3xl p-6 border border-blue-500/30">
                            <span className="text-xs text-blue-400 uppercase font-semibold">Scheduled / Active</span>
                            <span className="text-3xl font-extrabold text-blue-300 block mt-1">{appointmentsReport.scheduled}</span>
                        </div>
                        <div className="glass-card rounded-3xl p-6 border border-red-500/30">
                            <span className="text-xs text-red-400 uppercase font-semibold">Cancelled / No Show</span>
                            <span className="text-3xl font-extrabold text-red-300 block mt-1">
                                {appointmentsReport.cancelled + appointmentsReport.no_show}
                            </span>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4">
                        <h3 className="text-lg font-bold text-white">Recent Appointments Volume</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4">Patient</th>
                                        <th className="px-6 py-4">Chiropractor</th>
                                        <th className="px-6 py-4">Service Type</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {appointmentsReport.list.map((apt) => (
                                        <tr key={apt.id} className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4 font-bold text-white">
                                                {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-300">{apt.chiropractor?.name || 'Staff Doctor'}</td>
                                            <td className="px-6 py-4 text-xs font-semibold text-purple-300">{apt.service_type}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                                {new Date(apt.appointment_date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                                                    {apt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: PATIENTS REPORT */}
            {activeTab === 'patients' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="glass-card rounded-3xl p-6 border border-white/10">
                            <span className="text-xs text-gray-400 uppercase font-semibold">Total Registered Patients</span>
                            <span className="text-3xl font-extrabold text-white block mt-1">{patientsReport.totalPatients}</span>
                        </div>
                        <div className="glass-card rounded-3xl p-6 border border-purple-500/30">
                            <span className="text-xs text-purple-400 uppercase font-semibold">New Patient Acquisitions</span>
                            <span className="text-3xl font-extrabold text-purple-300 block mt-1">{patientsReport.newPatients}</span>
                        </div>
                        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30">
                            <span className="text-xs text-emerald-400 uppercase font-semibold">Active Care Patients</span>
                            <span className="text-3xl font-extrabold text-emerald-300 block mt-1">{patientsReport.activePatients}</span>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4">
                        <h3 className="text-lg font-bold text-white">Insurance Coverage Distribution</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {patientsReport.insuranceBreakdown.map((ins, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-300">{ins.insurance || 'Self Pay'}</span>
                                    <span className="text-lg font-extrabold text-purple-300 font-mono">{ins.count} patients</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: CHIROPRACTOR PERFORMANCE REPORT */}
            {activeTab === 'performance' && (
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white">Doctor & Chiropractor Performance Leaderboard</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4">Doctor Name</th>
                                    <th className="px-6 py-4">Specialty & Suite</th>
                                    <th className="px-6 py-4 text-center">Completed Visits</th>
                                    <th className="px-6 py-4 text-center">Completion Rate</th>
                                    <th className="px-6 py-4 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {performanceReport.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-white/[0.02]">
                                        <td className="px-6 py-4 font-bold text-white text-base">{doc.name}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {doc.specialty} • {doc.room_number}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-purple-300">
                                            {doc.completed_visits} / {doc.total_appointments}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                {doc.completion_rate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold text-emerald-400 font-mono">
                                            ${doc.revenue_generated.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: OUTSTANDING PAYMENTS REPORT */}
            {activeTab === 'outstanding' && (
                <div className="glass-card rounded-3xl p-8 border border-amber-500/30 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">Outstanding & Overdue Invoices Aging Report</h3>
                            <span className="text-xs text-amber-400">Unpaid balances requiring follow-up</span>
                        </div>
                        <span className="text-xs font-mono text-amber-300 font-bold">
                            {outstandingReport.length} invoices pending
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4">Invoice #</th>
                                    <th className="px-6 py-4">Patient Name</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Days Overdue</th>
                                    <th className="px-6 py-4 text-right">Balance Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {outstandingReport.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No outstanding payments due.
                                        </td>
                                    </tr>
                                ) : (
                                    outstandingReport.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4 font-mono font-bold text-purple-300">{inv.invoice_number}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-white block">{inv.patient_name}</span>
                                                <span className="text-xs text-gray-400 font-mono">{inv.patient_phone}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-300">{inv.due_date}</td>
                                            <td className="px-6 py-4">
                                                {inv.days_past_due > 0 ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                                        {inv.days_past_due} days overdue
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                        Due soon
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-extrabold text-amber-300 font-mono">
                                                ${inv.balance_due.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
