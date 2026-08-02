import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface DoctorRevenue {
    id: number;
    name: string;
    specialty: string;
    avatar?: string | null;
    total_revenue: number;
    paid_revenue: number;
    invoice_count: number;
    share_percentage: number;
}

interface ServiceRevenue {
    name: string;
    revenue: number;
    count: number;
    share_percentage: number;
}

interface MonthlyTrendItem {
    month: string;
    revenue: number;
}

interface OutstandingInvoice {
    id: number;
    invoice_number: string;
    issue_date: string | null;
    due_date: string | null;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    status: string;
    patient?: { id: number; first_name: string; last_name: string } | null;
    doctor?: { id: number; name: string } | null;
}

interface FinancialDashboardProps {
    metrics: {
        daily_income: number;
        daily_change: number;
        monthly_income: number;
        monthly_change: number;
        outstanding_amount: number;
        outstanding_count: number;
        ytd_revenue: number;
    };
    revenueByChiropractor: DoctorRevenue[];
    revenueByService: ServiceRevenue[];
    monthlyTrend: MonthlyTrendItem[];
    outstandingInvoices: OutstandingInvoice[];
}

export default function Index({
    metrics,
    revenueByChiropractor,
    revenueByService,
    monthlyTrend,
    outstandingInvoices,
}: FinancialDashboardProps) {
    const maxMonthlyTrendRevenue = Math.max(...monthlyTrend.map((m) => m.revenue), 1000);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Financial <span className="gradient-text">Analytics Dashboard</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Real-time tracking of daily income, monthly revenue, outstanding balances, and service breakdowns.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('billing.index')}
                            className="px-4 py-2.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 font-extrabold text-xs transition-all flex items-center gap-2"
                        >
                            <span>💳</span>
                            <span>Billing & Invoices</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Financial Dashboard" />

            <div className="space-y-8">
                {/* Top 4 KPI Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 1. Daily Income */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Daily Income</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                💵
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                                ${metrics.daily_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs">
                                <span className={`font-mono font-bold ${metrics.daily_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {metrics.daily_change >= 0 ? `▲ +${metrics.daily_change}%` : `▼ ${metrics.daily_change}%`}
                                </span>
                                <span className="text-gray-400">vs yesterday</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Monthly Income */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-indigo-300">Monthly Income</span>
                            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-lg border border-indigo-500/20">
                                📅
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                                ${metrics.monthly_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs">
                                <span className={`font-mono font-bold ${metrics.monthly_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {metrics.monthly_change >= 0 ? `▲ +${metrics.monthly_change}%` : `▼ ${metrics.monthly_change}%`}
                                </span>
                                <span className="text-gray-400">vs last month</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Outstanding Payments */}
                    <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-amber-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-amber-300">Outstanding Balance</span>
                            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 text-lg border border-amber-500/20">
                                ⏳
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-amber-300 font-mono tracking-tight">
                                ${metrics.outstanding_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">
                                Across <span className="text-white font-bold">{metrics.outstanding_count}</span> unpaid invoices
                            </p>
                        </div>
                    </div>

                    {/* 4. YTD Collected Revenue */}
                    <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-emerald-300">YTD Revenue</span>
                            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-lg border border-emerald-500/20">
                                📊
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                                ${metrics.ytd_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">
                                Total collected this year
                            </p>
                        </div>
                    </div>
                </div>

                {/* 6-Month Historical Revenue Trend Chart & Service Revenue Breakdown Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 6-Month Historical Trend Bar Chart */}
                    <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    <span>📈 6-Month Revenue Growth Trend</span>
                                </h3>
                                <p className="text-xs text-gray-400">Monthly payment collection history over the past 6 months.</p>
                            </div>
                        </div>

                        <div className="h-48 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-white/10">
                            {monthlyTrend.map((item, idx) => {
                                const heightPct = maxMonthlyTrendRevenue > 0
                                    ? Math.max(15, Math.round((item.revenue / maxMonthlyTrendRevenue) * 100))
                                    : 15;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <span className="text-[11px] font-mono text-purple-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            ${item.revenue.toLocaleString()}
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

                    {/* Revenue by Service Breakdown Card */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>🛠️ Revenue by Service</span>
                            </h3>
                            <p className="text-xs text-gray-400">Categorized income across treatment types.</p>
                        </div>

                        <div className="space-y-4">
                            {revenueByService.map((srv, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-gray-200 truncate max-w-[170px]">{srv.name}</span>
                                        <span className="font-mono text-purple-300 font-bold">
                                            ${srv.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                            style={{ width: `${srv.share_percentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                                        <span>{srv.count} sessions</span>
                                        <span>{srv.share_percentage}% share</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Revenue by Chiropractor (Doctor) Cards */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>🩺 Revenue by Chiropractor</span>
                            </h3>
                            <p className="text-xs text-gray-400">Individual doctor earnings, invoice counts, and clinic share.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {revenueByChiropractor.map((doc) => (
                            <div
                                key={doc.id}
                                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all space-y-4 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shrink-0">
                                        {doc.avatar ? (
                                            <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover rounded-[14px]" />
                                        ) : (
                                            <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center text-white font-extrabold text-base">
                                                {doc.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                            {doc.name}
                                        </h4>
                                        <span className="text-xs text-purple-400 font-mono block">{doc.specialty}</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 font-mono">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Total Billed Revenue:</span>
                                        <span className="text-white font-black text-sm">
                                            ${doc.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Total Invoices Issued:</span>
                                        <span className="text-purple-300 font-bold">{doc.invoice_count} Invoices</span>
                                    </div>

                                    <div className="pt-2 border-t border-white/10">
                                        <div className="flex items-center justify-between text-[11px] mb-1">
                                            <span className="text-gray-400">Clinic Revenue Share:</span>
                                            <span className="text-emerald-300 font-bold">{doc.share_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                                style={{ width: `${doc.share_percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outstanding Invoices & Pending Payments Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>⏳ Outstanding Unpaid Payments ({outstandingInvoices.length})</span>
                            </h3>
                            <p className="text-xs text-gray-400">Invoices requiring payment collection or patient follow-up.</p>
                        </div>

                        <Link
                            href={route('billing.index')}
                            className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-extrabold transition-colors"
                        >
                            Open Billing Center →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                <tr>
                                    <th className="p-4">Invoice #</th>
                                    <th className="p-4">Patient</th>
                                    <th className="p-4">Attending Doctor</th>
                                    <th className="p-4">Issue Date</th>
                                    <th className="p-4">Total Billed</th>
                                    <th className="p-4">Balance Due</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                {outstandingInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-500 font-mono">
                                            ✓ No outstanding unpaid invoices. All billing accounts settled!
                                        </td>
                                    </tr>
                                ) : (
                                    outstandingInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                                            <td className="p-4 font-bold text-white">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-extrabold text-white block">
                                                    {inv.patient?.first_name} {inv.patient?.last_name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-purple-300">
                                                {inv.doctor?.name || 'Unassigned'}
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {inv.issue_date}
                                            </td>
                                            <td className="p-4 font-bold text-white">
                                                ${inv.total_amount.toFixed(2)}
                                            </td>
                                            <td className="p-4 font-extrabold text-amber-300">
                                                ${inv.balance_due.toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold border capitalize ${
                                                        inv.status === 'overdue'
                                                            ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
                                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                    }`}
                                                >
                                                    {inv.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    href={route('billing.index')}
                                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md text-[11px]"
                                                >
                                                    Collect Payment 💳
                                                </Link>
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
