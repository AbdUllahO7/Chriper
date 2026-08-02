import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';

export interface ReferredPatient {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    created_at: string;
    referral_source: 'doctor' | 'friend' | 'social_media' | 'google_search' | 'walk_in' | 'advertisement' | 'other';
    referred_by_name: string | null;
    referral_notes: string | null;
    invoices?: Array<{ total_amount: number }>;
}

export interface SourceStat {
    key: string;
    label: string;
    count: number;
    percentage: number;
}

export interface TopReferrer {
    name: string;
    source: string;
    count: number;
    revenue: number;
}

interface IndexProps {
    metrics: {
        total_patients: number;
        total_referrals: number;
        referral_rate: number;
        top_source: string;
        revenue_from_referrals: number;
    };
    sourceStats: SourceStat[];
    topReferrers: TopReferrer[];
    referralRegistry: {
        data: ReferredPatient[];
        links: any[];
    };
    patientsList: Array<{ id: number; first_name: string; last_name: string }>;
    sources: Record<string, string>;
    filters: { search: string; referral_source: string };
}

export default function Index({
    metrics,
    sourceStats,
    topReferrers,
    referralRegistry,
    patientsList,
    sources,
    filters,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [sourceFilter, setSourceFilter] = useState(filters.referral_source || '');

    const [editingPatient, setEditingPatient] = useState<ReferredPatient | null>(null);

    // Update Referral Form
    const referralForm = useForm({
        referral_source: 'doctor' as ReferredPatient['referral_source'],
        referred_by_name: '',
        referral_notes: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('referrals.index'), { search, referral_source: sourceFilter }, { preserveState: true });
    };

    const handleSourceFilterChange = (src: string) => {
        setSourceFilter(src);
        router.get(route('referrals.index'), { search, referral_source: src }, { preserveState: true });
    };

    const handleOpenEditReferral = (patient: ReferredPatient) => {
        setEditingPatient(patient);
        referralForm.setData({
            referral_source: patient.referral_source || 'walk_in',
            referred_by_name: patient.referred_by_name || '',
            referral_notes: patient.referral_notes || '',
        });
    };

    const handleUpdateReferralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPatient) return;

        referralForm.post(route('patients.update-referral', editingPatient.id), {
            onSuccess: () => setEditingPatient(null),
        });
    };

    const getSourceBadgeStyle = (src: string) => {
        switch (src) {
            case 'doctor':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'friend':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'social_media':
                return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            case 'google_search':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'advertisement':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getSourceIcon = (src: string) => {
        switch (src) {
            case 'doctor':
                return '🩺';
            case 'friend':
                return '🤝';
            case 'social_media':
                return '📱';
            case 'google_search':
                return '🔍';
            case 'advertisement':
                return '📢';
            default:
                return '🚶';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Patient Referral <span className="gradient-text">Tracking & Analytics</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Track who referred your patients (Doctors, Friends, Social Media), referral channels, and statistics.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Patient Referral Tracking" />

            <div className="space-y-8">
                {/* Top 4 KPI Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 1. Total Referred Patients */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Total Referred Patients</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                📢
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                                {metrics.total_referrals} <span className="text-xs text-gray-400 font-normal">Patients</span>
                            </h3>
                            <p className="text-xs text-purple-300 font-mono mt-1">
                                {metrics.referral_rate}% of total clinic roster
                            </p>
                        </div>
                    </div>

                    {/* 2. Top Referral Channel */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-indigo-300">Top Referral Channel</span>
                            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-lg border border-indigo-500/20">
                                🏆
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-white truncate leading-snug">
                                {metrics.top_source}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">
                                Primary acquisition driver
                            </p>
                        </div>
                    </div>

                    {/* 3. Referral Generated Revenue */}
                    <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-emerald-300">Referral Generated Revenue</span>
                            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-lg border border-emerald-500/20">
                                💵
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                                ${metrics.revenue_from_referrals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">
                                Revenue from referred clients
                            </p>
                        </div>
                    </div>

                    {/* 4. Referral Rate % */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Practice Referral Rate</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                📊
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                                {metrics.referral_rate}%
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">
                                Organic referral ratio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Referral Source Breakdown & Top Referrer Champions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Source Breakdown Distribution */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>📊 Referral Source Distribution</span>
                            </h3>
                            <p className="text-xs text-gray-400">Share of new patient acquisitions by referral channel.</p>
                        </div>

                        <div className="space-y-4">
                            {sourceStats.map((stat) => (
                                <div key={stat.key} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-gray-200 flex items-center gap-2">
                                            <span>{getSourceIcon(stat.key)}</span>
                                            <span>{stat.label}</span>
                                        </span>
                                        <span className="font-mono text-purple-300 font-bold">
                                            {stat.count} Patients ({stat.percentage}%)
                                        </span>
                                    </div>

                                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                            style={{ width: `${stat.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Referrer Champions Leaderboard */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>🏆 Top Referrer Champions</span>
                            </h3>
                            <p className="text-xs text-gray-400">Doctors and patients who refer the most new clients.</p>
                        </div>

                        <div className="space-y-3">
                            {topReferrers.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-8">No referrer champions logged yet.</p>
                            ) : (
                                topReferrers.map((ref, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 font-bold font-mono flex items-center justify-center border border-purple-500/40">
                                                #{idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="font-extrabold text-white">{ref.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border mt-0.5 inline-block ${getSourceBadgeStyle(ref.source)}`}>
                                                    {getSourceIcon(ref.source)} {ref.source}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right font-mono">
                                            <span className="text-emerald-300 font-extrabold block">
                                                ${ref.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-purple-300 font-bold block text-[11px]">
                                                {ref.count} Patients Referred
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Patient Referral Registry Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4">
                    {/* Filter Bar */}
                    <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search patient or referrer name..."
                                className="w-full bg-[#0b0f19] text-white rounded-xl px-4 py-2.5 border border-white/15 focus:border-purple-500 outline-none text-xs"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold text-xs hover:bg-purple-600/30 transition-colors"
                            >
                                Search
                            </button>
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            {['', 'doctor', 'friend', 'social_media', 'google_search', 'walk_in'].map((src) => (
                                <button
                                    key={src}
                                    onClick={() => handleSourceFilterChange(src)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                                        sourceFilter === src
                                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                            : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                    }`}
                                >
                                    {src === '' ? 'All Sources' : `${getSourceIcon(src)} ${src.replace('_', ' ')}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                <tr>
                                    <th className="p-4">Patient Name</th>
                                    <th className="p-4">Referral Source</th>
                                    <th className="p-4">Referred By (Name/Channel)</th>
                                    <th className="p-4">Registration Date</th>
                                    <th className="p-4">Total Patient Revenue</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                {referralRegistry.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                                            No patient referrals found.
                                        </td>
                                    </tr>
                                ) : (
                                    referralRegistry.data.map((patient) => {
                                        const patientRevenue = (patient.invoices || []).reduce(
                                            (acc, inv) => acc + (inv.total_amount || 0),
                                            0
                                        );

                                        return (
                                            <tr key={patient.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4">
                                                    <Link
                                                        href={route('patients.show', patient.id)}
                                                        className="font-extrabold text-white hover:text-purple-300 transition-colors block"
                                                    >
                                                        {patient.first_name} {patient.last_name}
                                                    </Link>
                                                    <span className="text-[11px] text-gray-400 font-mono block">
                                                        {patient.email}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${getSourceBadgeStyle(
                                                            patient.referral_source
                                                        )}`}
                                                    >
                                                        {getSourceIcon(patient.referral_source)} {patient.referral_source.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white">
                                                    {patient.referred_by_name || 'Self / Walk-in'}
                                                </td>
                                                <td className="p-4 font-mono text-gray-400">
                                                    {new Date(patient.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 font-mono font-extrabold text-emerald-300">
                                                    ${patientRevenue.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleOpenEditReferral(patient)}
                                                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 font-bold transition-colors"
                                                    >
                                                        Edit Referral ✏️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Update Patient Referral Modal */}
            {editingPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>📢 Update Referral for {editingPatient.first_name} {editingPatient.last_name}</span>
                            </h3>
                            <button onClick={() => setEditingPatient(null)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateReferralSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Referral Source *</label>
                                <select
                                    value={referralForm.data.referral_source}
                                    onChange={(e) => referralForm.setData('referral_source', e.target.value as any)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs capitalize"
                                >
                                    {Object.entries(sources).map(([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Referred By (Doctor Name, Friend Name, or Handle)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dr. Sarah Jenkins, John Doe, Instagram"
                                    value={referralForm.data.referred_by_name}
                                    onChange={(e) => referralForm.setData('referred_by_name', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Referral Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Additional context or referral incentive notes..."
                                    value={referralForm.data.referral_notes}
                                    onChange={(e) => referralForm.setData('referral_notes', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setEditingPatient(null)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Save Referral Info
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
