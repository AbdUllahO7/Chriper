import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export interface BranchItem {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    is_main_branch: boolean;
    is_active: boolean;
    doctors_count?: number;
    appointments_count?: number;
    patients_count?: number;
    monthly_revenue: number;
    monthly_appointments: number;
}

interface IndexProps {
    branches: BranchItem[];
    activeBranchId: string | number;
    metrics: {
        total_branches: number;
        active_branches_count: number;
        total_doctors: number;
        total_monthly_revenue: number;
        total_monthly_appointments: number;
    };
}

export default function Index({ branches, activeBranchId, metrics }: IndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);

    // Branch Form
    const branchForm = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        is_main_branch: false,
        is_active: true,
    });

    const maxRevenue = Math.max(...branches.map((b) => b.monthly_revenue), 1000);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        branchForm.post(route('branches.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                branchForm.reset();
            },
        });
    };

    const handleEditOpen = (b: BranchItem) => {
        setEditingBranch(b);
        branchForm.setData({
            name: b.name,
            code: b.code,
            address: b.address || '',
            phone: b.phone || '',
            email: b.email || '',
            is_main_branch: b.is_main_branch,
            is_active: b.is_active,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBranch) return;

        branchForm.put(route('branches.update', editingBranch.id), {
            onSuccess: () => setEditingBranch(null),
        });
    };

    const handleDelete = (b: BranchItem) => {
        if (confirm(`Are you sure you want to delete branch '${b.name}'?`)) {
            router.delete(route('branches.destroy', b.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Multi-Clinic <span className="gradient-text">Branch Management</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Manage multiple clinic locations, separate schedules, staff assignments, and branch performance.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                branchForm.reset();
                                setIsCreateModalOpen(true);
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                        >
                            <span>📍 Add Clinic Branch</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Multi-Clinic Support" />

            <div className="space-y-8">
                {/* Top 4 KPI Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 1. Total Branches */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Total Locations</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                📍
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.total_branches} Branches</h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">{metrics.active_branches_count} active locations</p>
                        </div>
                    </div>

                    {/* 2. Total Doctors */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-indigo-300">Multi-Branch Doctors</span>
                            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-lg border border-indigo-500/20">
                                🩺
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.total_doctors} Chiropractors</h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Assigned across branches</p>
                        </div>
                    </div>

                    {/* 3. Monthly Revenue */}
                    <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-emerald-300">Multi-Branch Revenue</span>
                            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-lg border border-emerald-500/20">
                                💵
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                                ${metrics.total_monthly_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Combined monthly earnings</p>
                        </div>
                    </div>

                    {/* 4. Total Monthly Appointments */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Monthly Appointments</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                📅
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.total_monthly_appointments} Visits</h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Across all schedules</p>
                        </div>
                    </div>
                </div>

                {/* Comparative Performance Chart */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                    <div className="border-b border-white/10 pb-4">
                        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                            <span>📈 Branch Revenue & Appointment Comparison</span>
                        </h3>
                        <p className="text-xs text-gray-400">Comparative monthly performance breakdown across clinic locations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {branches.map((b) => (
                            <div key={b.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-extrabold text-white text-sm truncate">{b.name}</h4>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {b.code}
                                    </span>
                                </div>

                                <div className="space-y-1 font-mono">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Monthly Earnings:</span>
                                        <span className="text-emerald-300 font-extrabold">
                                            ${b.monthly_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                            style={{ width: `${maxRevenue > 0 ? Math.round((b.monthly_revenue / maxRevenue) * 100) : 0}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-[11px] pt-1 text-gray-400">
                                        <span>Monthly Visits:</span>
                                        <span className="text-purple-300 font-bold">{b.monthly_appointments} Visits</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Clinic Branches Cards Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                            <span>📍 Clinic Locations ({branches.length})</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {branches.map((b) => (
                            <div
                                key={b.id}
                                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all space-y-5 flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {b.is_main_branch && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                    ⭐ Main HQ
                                                </span>
                                            )}
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                {b.code}
                                            </span>
                                        </div>

                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                                                b.is_active
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                            }`}
                                        >
                                            {b.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                            {b.name}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">{b.address || 'No address specified.'}</p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Phone:</span>
                                            <span className="text-white font-bold">{b.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Assigned Doctors:</span>
                                            <span className="text-purple-300 font-bold">{b.doctors_count ?? 0} Chiropractors</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Patients:</span>
                                            <span className="text-white font-bold">{b.patients_count ?? 0} Patients</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => handleEditOpen(b)}
                                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors"
                                    >
                                        Edit Details ✏️
                                    </button>
                                    {!b.is_main_branch && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(b)}
                                            className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                                        >
                                            Delete 🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Branch Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>📍 Add New Clinic Branch</span>
                            </h3>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Branch Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Chirper East - Spinal Center"
                                        value={branchForm.data.name}
                                        onChange={(e) => branchForm.setData('name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Code *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="EAST"
                                        value={branchForm.data.code}
                                        onChange={(e) => branchForm.setData('code', e.target.value.toUpperCase())}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs uppercase font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Street Address</label>
                                <textarea
                                    rows={2}
                                    placeholder="Full street address and building number..."
                                    value={branchForm.data.address}
                                    onChange={(e) => branchForm.setData('address', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="(555) 000-0000"
                                        value={branchForm.data.phone}
                                        onChange={(e) => branchForm.setData('phone', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="east@chirperspine.com"
                                        value={branchForm.data.email}
                                        onChange={(e) => branchForm.setData('email', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Create Branch Location
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Branch Modal */}
            {editingBranch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>✏️ Edit Branch {editingBranch.name}</span>
                            </h3>
                            <button type="button" onClick={() => setEditingBranch(null)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Branch Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={branchForm.data.name}
                                        onChange={(e) => branchForm.setData('name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={branchForm.data.code}
                                        onChange={(e) => branchForm.setData('code', e.target.value.toUpperCase())}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs uppercase font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Address</label>
                                <textarea
                                    rows={2}
                                    value={branchForm.data.address}
                                    onChange={(e) => branchForm.setData('address', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={branchForm.data.phone}
                                        onChange={(e) => branchForm.setData('phone', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={branchForm.data.email}
                                        onChange={(e) => branchForm.setData('email', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setEditingBranch(null)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Save Branch Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
