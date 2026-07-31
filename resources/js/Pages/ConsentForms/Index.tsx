import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export interface ConsentFormItem {
    id: number;
    patient_id: number;
    form_type: 'initial_consent' | 'privacy_policy' | 'treatment_consent' | 'custom';
    title: string;
    content: string;
    signer_name: string | null;
    signature_data: string | null;
    signature_url: string | null;
    signed_at: string | null;
    ip_address: string | null;
    status: 'pending' | 'signed' | 'declined';
    patient?: { id: number; first_name: string; last_name: string; email: string };
}

interface IndexProps {
    consentForms: {
        data: ConsentFormItem[];
        links: any[];
    };
    patients: Array<{ id: number; first_name: string; last_name: string; email?: string }>;
    templates: Record<string, { title: string; content: string }>;
    filters: { search: string; patient_id: string; status: string };
}

export default function Index({ consentForms, patients, templates, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingForm, setDeletingForm] = useState<ConsentFormItem | null>(null);

    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('initial_consent');

    const createForm = useForm({
        patient_id: patients[0]?.id || '',
        form_type: 'initial_consent',
        title: templates.initial_consent?.title || 'Initial Chiropractic Care Informed Consent',
        content: templates.initial_consent?.content || '',
    });

    const handleTemplateSelect = (key: string) => {
        setSelectedTemplateKey(key);
        if (key in templates) {
            createForm.setData((prev) => ({
                ...prev,
                form_type: key as any,
                title: templates[key].title,
                content: templates[key].content,
            }));
        } else {
            createForm.setData((prev) => ({
                ...prev,
                form_type: 'custom',
                title: '',
                content: '',
            }));
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('consent-forms.index'),
            { search, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleStatusFilterChange = (st: string) => {
        setStatusFilter(st);
        router.get(
            route('consent-forms.index'),
            { search, status: st },
            { preserveState: true }
        );
    };

    const handleCreateForm = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('consent-forms.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const confirmDeleteForm = () => {
        if (deletingForm) {
            router.delete(route('consent-forms.destroy', deletingForm.id));
        }
    };

    const getTypeBadge = (type: ConsentFormItem['form_type']) => {
        if (type === 'initial_consent') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        if (type === 'privacy_policy') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (type === 'treatment_consent') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Digital Consent Forms <span className="gradient-text">& E-Signatures</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Issue legal intake forms, privacy authorizations, and capture electronic signatures.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                    >
                        <span>✍️</span>
                        <span>Issue Digital Consent Form</span>
                    </button>
                </div>
            }
        >
            <Head title="Digital Consent Forms & E-Signatures" />

            <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search document title or patient name..."
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
                        {['', 'pending', 'signed'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilterChange(st)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                                    statusFilter === st
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                }`}
                            >
                                {st === '' ? 'All Forms' : st === 'pending' ? 'Pending Signature' : 'Signed & Verified'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Consent Forms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {consentForms.data.length === 0 ? (
                        <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-white/10 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mx-auto border border-purple-500/20">
                                ✍️
                            </div>
                            <h3 className="text-lg font-bold text-white">No Digital Consent Forms Issued</h3>
                            <p className="text-xs text-gray-400 max-w-md mx-auto">
                                Issue digital intake consent forms, HIPAA privacy notices, or procedure authorizations for your patients to sign electronically.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all inline-block mt-2"
                            >
                                Issue First Consent Form
                            </button>
                        </div>
                    ) : (
                        consentForms.data.map((form) => (
                            <div
                                key={form.id}
                                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${getTypeBadge(form.form_type)}`}>
                                            {form.form_type.replace('_', ' ')}
                                        </span>

                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                form.status === 'signed'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                                            }`}
                                        >
                                            {form.status === 'signed' ? '✓ Signed & Verified' : '⏱️ Pending Signature'}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                            {form.title}
                                        </h3>
                                        <p className="text-xs text-purple-300 font-semibold mt-0.5">
                                            Patient: {form.patient?.first_name} {form.patient?.last_name}
                                        </p>
                                    </div>

                                    {form.status === 'signed' ? (
                                        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400">Signer:</span>
                                                <span className="text-emerald-300 font-bold">{form.signer_name}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                                                <span>Timestamp:</span>
                                                <span>{new Date(form.signed_at!).toLocaleString()}</span>
                                            </div>

                                            {form.signature_url && (
                                                <div className="pt-2 border-t border-emerald-500/20 flex justify-center">
                                                    <img
                                                        src={form.signature_url}
                                                        alt="E-Signature"
                                                        className="max-h-12 object-contain filter invert opacity-90"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                                            <span className="text-xs font-semibold text-amber-300 block">Awaiting Patient E-Signature</span>
                                            <span className="text-[11px] text-gray-400 block">Open document to sign electronically via touchscreen or mouse.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <button
                                        onClick={() => setDeletingForm(form)}
                                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 text-xs font-bold transition-colors"
                                    >
                                        Delete
                                    </button>

                                    <Link
                                        href={route('consent-forms.show', form.id)}
                                        className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all shadow-md ${
                                            form.status === 'signed'
                                                ? 'bg-white/5 hover:bg-white/10 text-purple-300 border border-white/10'
                                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                                        }`}
                                    >
                                        {form.status === 'signed' ? 'View Document & Signature' : '✍️ Open & Sign Document'}
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deletingForm}
                title="Delete Consent Form"
                message="Are you sure you want to delete this consent form document?"
                confirmText="Delete Document"
                onConfirm={confirmDeleteForm}
                onClose={() => setDeletingForm(null)}
            />

            {/* Issue Digital Consent Form Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>✍️ Issue Digital Consent Form</span>
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateForm} className="space-y-4">
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
                                            {p.first_name} {p.last_name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Template Selector Pills */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                                    Select Document Template
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {Object.keys(templates).map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleTemplateSelect(key)}
                                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left capitalize ${
                                                selectedTemplateKey === key
                                                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                                                    : 'bg-white/5 text-gray-400 hover:text-white border-white/10'
                                            }`}
                                        >
                                            {key.replace('_', ' ')}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleTemplateSelect('custom')}
                                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                                            selectedTemplateKey === 'custom'
                                                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                                                : 'bg-white/5 text-gray-400 hover:text-white border-white/10'
                                        }`}
                                    >
                                        Custom Form
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Document Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Legal Text & Terms *
                                </label>
                                <textarea
                                    rows={8}
                                    required
                                    value={createForm.data.content}
                                    onChange={(e) => createForm.setData('content', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3.5 border border-white/15 focus:border-purple-500 outline-none text-xs font-mono leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
                                >
                                    Issue Document to Patient
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
