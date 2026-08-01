import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export interface InsurancePolicyItem {
    id: number;
    patient_id: number;
    insurance_company: string;
    policy_number: string;
    group_number: string | null;
    coverage_percentage: number;
    copay_amount: number;
    deductible_amount: number;
    deductible_met: number;
    max_visits_per_year: number;
    used_visits: number;
    remaining_visits: number;
    effective_date: string | null;
    expiration_date: string | null;
    status: 'active' | 'expired' | 'pending_verification';
    patient?: { id: number; first_name: string; last_name: string; email: string };
}

export interface InsuranceClaimItem {
    id: number;
    patient_id: number;
    insurance_policy_id: number;
    invoice_id: number | null;
    claim_number: string;
    claim_date: string;
    billed_amount: number;
    allowed_amount: number | null;
    paid_amount: number;
    patient_responsibility: number;
    claim_status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'partially_paid' | 'denied';
    denial_reason: string | null;
    notes: string | null;
    patient?: { id: number; first_name: string; last_name: string };
    insurancePolicy?: { insurance_company: string; policy_number: string };
}

interface IndexProps {
    policies: InsurancePolicyItem[];
    claims: {
        data: InsuranceClaimItem[];
        links: any[];
    };
    patients: Array<{ id: number; first_name: string; last_name: string; email: string }>;
    invoices: Array<{ id: number; invoice_number: string; total_amount: number; patient?: { first_name: string; last_name: string } }>;
    filters: { search: string; claim_status: string; patient_id: string };
    claimStatuses: string[];
    insuranceCarriers: string[];
}

export default function Index({ policies, claims, patients, invoices, filters, claimStatuses, insuranceCarriers }: IndexProps) {
    const [activeTab, setActiveTab] = useState<'policies' | 'claims'>('policies');
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.claim_status || '');

    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [isSubmitClaimModalOpen, setIsSubmitClaimModalOpen] = useState(false);

    const [editingClaim, setEditingClaim] = useState<InsuranceClaimItem | null>(null);
    const [deletingPolicy, setDeletingPolicy] = useState<InsurancePolicyItem | null>(null);
    const [deletingClaim, setDeletingClaim] = useState<InsuranceClaimItem | null>(null);

    // Form for Adding Policy
    const policyForm = useForm({
        patient_id: patients[0]?.id || '',
        insurance_company: insuranceCarriers[0] || 'BlueCross BlueShield',
        policy_number: '',
        group_number: '',
        coverage_percentage: 80,
        copay_amount: 25,
        deductible_amount: 500,
        deductible_met: 0,
        max_visits_per_year: 20,
        used_visits: 0,
        effective_date: new Date().toISOString().split('T')[0],
        expiration_date: '',
        status: 'active',
    });

    // Form for Submitting Claim
    const claimForm = useForm({
        patient_id: patients[0]?.id || '',
        insurance_policy_id: policies[0]?.id || '',
        invoice_id: invoices[0]?.id || '',
        claim_date: new Date().toISOString().split('T')[0],
        billed_amount: 150.00,
        notes: '',
    });

    // Form for Updating Claim Adjudication Status
    const claimStatusForm = useForm({
        claim_status: 'submitted' as InsuranceClaimItem['claim_status'],
        allowed_amount: 0,
        paid_amount: 0,
        patient_responsibility: 0,
        denial_reason: '',
        notes: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('insurance.index'), { search, claim_status: statusFilter }, { preserveState: true });
    };

    const handleStatusFilterChange = (st: string) => {
        setStatusFilter(st);
        router.get(route('insurance.index'), { search, claim_status: st }, { preserveState: true });
    };

    const handleAddPolicySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        policyForm.post(route('insurance.policies.store'), {
            onSuccess: () => {
                policyForm.reset();
                setIsAddPolicyModalOpen(false);
            },
        });
    };

    const handleSubmitClaimSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        claimForm.post(route('insurance.claims.store'), {
            onSuccess: () => {
                claimForm.reset();
                setIsSubmitClaimModalOpen(false);
            },
        });
    };

    const handleOpenEditClaim = (claim: InsuranceClaimItem) => {
        setEditingClaim(claim);
        claimStatusForm.setData({
            claim_status: claim.claim_status,
            allowed_amount: claim.allowed_amount || claim.billed_amount,
            paid_amount: claim.paid_amount || 0,
            patient_responsibility: claim.patient_responsibility || 0,
            denial_reason: claim.denial_reason || '',
            notes: claim.notes || '',
        });
    };

    const handleUpdateClaimStatusSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClaim) return;

        claimStatusForm.patch(route('insurance.claims.update-status', editingClaim.id), {
            onSuccess: () => setEditingClaim(null),
        });
    };

    const getClaimStatusBadge = (st: InsuranceClaimItem['claim_status']) => {
        switch (st) {
            case 'approved':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'partially_paid':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'in_review':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'submitted':
                return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
            case 'denied':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Insurance & <span className="gradient-text">Claims Management</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Track patient insurance coverage, policy numbers, remaining allowed visits, and claim status lifecycle.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSubmitClaimModalOpen(true)}
                            className="px-4 py-2.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 font-extrabold text-xs transition-all flex items-center gap-2"
                        >
                            <span>🧾</span>
                            <span>Submit Insurance Claim</span>
                        </button>

                        <button
                            onClick={() => setIsAddPolicyModalOpen(true)}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                        >
                            <span>🛡️</span>
                            <span>Add Patient Policy</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Insurance & Claims Management" />

            <div className="space-y-6">
                {/* Mode Switcher Tabs */}
                <div className="glass-card rounded-3xl p-3 border border-white/10 shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('policies')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                                activeTab === 'policies'
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <span>🛡️ Patient Policies ({policies.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('claims')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                                activeTab === 'claims'
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <span>🧾 Claims Tracker ({claims.data.length})</span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: Patient Policies */}
                {activeTab === 'policies' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {policies.length === 0 ? (
                            <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-white/10 space-y-3">
                                <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mx-auto border border-purple-500/20">
                                    🛡️
                                </div>
                                <h3 className="text-lg font-bold text-white">No Patient Insurance Policies</h3>
                                <p className="text-xs text-gray-400 max-w-md mx-auto">
                                    Add patient insurance policies to track annual allowed visits, remaining visits, copay, and deductible met.
                                </p>
                                <button
                                    onClick={() => setIsAddPolicyModalOpen(true)}
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all inline-block mt-2"
                                >
                                    Add First Policy
                                </button>
                            </div>
                        ) : (
                            policies.map((policy) => {
                                const usedPct = Math.min(100, Math.round((policy.used_visits / policy.max_visits_per_year) * 100));

                                return (
                                    <div
                                        key={policy.id}
                                        className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all space-y-5 flex flex-col justify-between group"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                    {policy.insurance_company}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                                    {policy.status}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                                    {policy.patient?.first_name} {policy.patient?.last_name}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                    Policy #: <span className="text-white font-bold">{policy.policy_number}</span>
                                                    {policy.group_number ? ` • Group #: ${policy.group_number}` : ''}
                                                </p>
                                            </div>

                                            {/* Remaining Visits Progress Meter */}
                                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                                                <div className="flex items-center justify-between text-xs font-mono">
                                                    <span className="text-purple-300 font-bold uppercase text-[10px]">Annual Visit Allowance</span>
                                                    <span className="text-white font-extrabold">
                                                        {policy.used_visits} / {policy.max_visits_per_year} Used
                                                    </span>
                                                </div>

                                                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${
                                                            policy.remaining_visits <= 3
                                                                ? 'bg-red-500'
                                                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                                        }`}
                                                        style={{ width: `${usedPct}%` }}
                                                    ></div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                                                    <span className="text-gray-400">Remaining Covered Visits:</span>
                                                    <span className={`font-extrabold ${policy.remaining_visits <= 3 ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`}>
                                                        {policy.remaining_visits} Visits Left
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Financial Coverage Metrics */}
                                            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                                                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-gray-400 block text-[9px] uppercase">Coverage</span>
                                                    <span className="text-purple-300 font-bold">{policy.coverage_percentage}%</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-gray-400 block text-[9px] uppercase">Copay</span>
                                                    <span className="text-emerald-300 font-bold">${policy.copay_amount}</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-gray-400 block text-[9px] uppercase">Deductible</span>
                                                    <span className="text-white font-bold">${policy.deductible_amount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                            <button
                                                onClick={() => setDeletingPolicy(policy)}
                                                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 text-xs font-bold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* TAB 2: Claims Tracker */}
                {activeTab === 'claims' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Search & Filter Bar */}
                        <div className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                            <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search claim # or patient name..."
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
                                {['', 'submitted', 'in_review', 'approved', 'partially_paid', 'denied'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => handleStatusFilterChange(st)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                                            statusFilter === st
                                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                        }`}
                                    >
                                        {st === '' ? 'All Claims' : st.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Claims Table */}
                        <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                        <tr>
                                            <th className="p-4">Claim #</th>
                                            <th className="p-4">Patient & Carrier</th>
                                            <th className="p-4">Claim Date</th>
                                            <th className="p-4">Billed Amount</th>
                                            <th className="p-4">Paid Amount</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-gray-300">
                                        {claims.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                                    No insurance claims submitted yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            claims.data.map((claim) => (
                                                <tr key={claim.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 font-mono font-bold text-white">
                                                        {claim.claim_number}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-extrabold text-white block">
                                                            {claim.patient?.first_name} {claim.patient?.last_name}
                                                        </span>
                                                        <span className="text-[11px] text-purple-300 font-mono block">
                                                            {claim.insurancePolicy?.insurance_company}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-mono">
                                                        {new Date(claim.claim_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-white">
                                                        ${claim.billed_amount.toFixed(2)}
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-emerald-300">
                                                        ${claim.paid_amount.toFixed(2)}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border capitalize ${getClaimStatusBadge(claim.claim_status)}`}>
                                                            {claim.claim_status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleOpenEditClaim(claim)}
                                                            className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 font-bold transition-colors"
                                                        >
                                                            Update Status ⚙️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Delete Policy Modal */}
            <ConfirmModal
                isOpen={!!deletingPolicy}
                title="Delete Insurance Policy"
                message="Are you sure you want to remove this insurance policy?"
                confirmText="Delete Policy"
                onConfirm={() => deletingPolicy && router.delete(route('insurance.policies.destroy', deletingPolicy.id))}
                onClose={() => setDeletingPolicy(null)}
            />

            {/* Add Patient Policy Modal */}
            {isAddPolicyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>🛡️ Add Patient Insurance Policy</span>
                            </h3>
                            <button onClick={() => setIsAddPolicyModalOpen(false)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddPolicySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Select Patient *</label>
                                <select
                                    value={policyForm.data.patient_id}
                                    onChange={(e) => policyForm.setData('patient_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Insurance Company *</label>
                                    <input
                                        type="text"
                                        required
                                        value={policyForm.data.insurance_company}
                                        onChange={(e) => policyForm.setData('insurance_company', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Policy Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={policyForm.data.policy_number}
                                        onChange={(e) => policyForm.setData('policy_number', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Coverage %</label>
                                    <input
                                        type="number"
                                        value={policyForm.data.coverage_percentage}
                                        onChange={(e) => policyForm.setData('coverage_percentage', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Copay ($)</label>
                                    <input
                                        type="number"
                                        value={policyForm.data.copay_amount}
                                        onChange={(e) => policyForm.setData('copay_amount', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Max Visits / Year</label>
                                    <input
                                        type="number"
                                        value={policyForm.data.max_visits_per_year}
                                        onChange={(e) => policyForm.setData('max_visits_per_year', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setIsAddPolicyModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Save Insurance Policy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submit Claim Modal */}
            {isSubmitClaimModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>🧾 Submit Insurance Claim</span>
                            </h3>
                            <button onClick={() => setIsSubmitClaimModalOpen(false)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitClaimSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Select Patient *</label>
                                <select
                                    value={claimForm.data.patient_id}
                                    onChange={(e) => claimForm.setData('patient_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Insurance Policy *</label>
                                <select
                                    value={claimForm.data.insurance_policy_id}
                                    onChange={(e) => claimForm.setData('insurance_policy_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                >
                                    {policies.map((pol) => (
                                        <option key={pol.id} value={pol.id}>
                                            {pol.insurance_company} ({pol.policy_number}) - {pol.remaining_visits} visits left
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Claim Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={claimForm.data.claim_date}
                                        onChange={(e) => claimForm.setData('claim_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Billed Amount ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={claimForm.data.billed_amount}
                                        onChange={(e) => claimForm.setData('billed_amount', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setIsSubmitClaimModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Submit Claim
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Claim Status Modal */}
            {editingClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>⚙️ Update Claim #{editingClaim.claim_number}</span>
                            </h3>
                            <button onClick={() => setEditingClaim(null)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateClaimStatusSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Claim Status *</label>
                                <select
                                    value={claimStatusForm.data.claim_status}
                                    onChange={(e) => claimStatusForm.setData('claim_status', e.target.value as any)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs uppercase"
                                >
                                    {claimStatuses.map((st) => (
                                        <option key={st} value={st}>
                                            {st.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Paid Amount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={claimStatusForm.data.paid_amount}
                                        onChange={(e) => claimStatusForm.setData('paid_amount', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Patient Responsibility ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={claimStatusForm.data.patient_responsibility}
                                        onChange={(e) => claimStatusForm.setData('patient_responsibility', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono font-bold"
                                    />
                                </div>
                            </div>

                            {claimStatusForm.data.claim_status === 'denied' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase text-red-400 mb-1">Denial Reason *</label>
                                    <textarea
                                        rows={3}
                                        value={claimStatusForm.data.denial_reason}
                                        onChange={(e) => claimStatusForm.setData('denial_reason', e.target.value)}
                                        placeholder="Enter insurance denial rationale..."
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-red-500/40 text-xs"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setEditingClaim(null)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Update Claim Status
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
