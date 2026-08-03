import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export interface CustomFormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
    options?: string[];
    required: boolean;
    placeholder?: string;
    help_text?: string;
}

export interface CustomFormModel {
    id: number;
    title: string;
    description: string | null;
    fields: CustomFormField[];
    status: 'draft' | 'published' | 'archived';
    is_active: boolean;
    submissions_count?: number;
    created_at: string;
}

interface IndexProps {
    forms: CustomFormModel[];
    metrics: {
        total_forms: number;
        published_count: number;
        draft_count: number;
        total_submissions: number;
    };
    starterTemplates: Array<{
        title: string;
        description: string;
        fields: CustomFormField[];
    }>;
}

export default function Index({ forms, metrics, starterTemplates }: IndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingForm, setDeletingForm] = useState<CustomFormModel | null>(null);

    const createForm = useForm({
        title: '',
        description: '',
        status: 'published' as CustomFormModel['status'],
        fields: [
            {
                id: 'field_1',
                label: 'Chief Pain Complaint / Location',
                type: 'textarea' as const,
                required: true,
                placeholder: 'Describe your spinal symptoms or health goals...',
            },
            {
                id: 'field_2',
                label: 'Pain Severity Scale (1 - 10)',
                type: 'number' as const,
                required: true,
                placeholder: '1 = Mild, 10 = Severe Pain',
            },
        ] as any,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('custom-forms.store'), {
            onSuccess: () => setIsCreateModalOpen(false),
        });
    };

    const handleUseTemplate = (tpl: typeof starterTemplates[0]) => {
        router.post(route('custom-forms.store'), {
            title: tpl.title,
            description: tpl.description,
            fields: tpl.fields as any,
            status: 'published',
        });
    };

    const handleDuplicate = (form: CustomFormModel) => {
        router.post(route('custom-forms.duplicate', form.id));
    };

    const handleDeleteSubmit = () => {
        if (!deletingForm) return;
        router.delete(route('custom-forms.destroy', deletingForm.id), {
            onSuccess: () => setDeletingForm(null),
        });
    };

    const copyPublicLink = (formId: number) => {
        const url = `${window.location.origin}/intake-forms/${formId}`;
        navigator.clipboard.writeText(url);
        alert(`Copied Public Intake Link to Clipboard:\n${url}`);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            No-Code Custom <span className="gradient-text">Intake Form Builder</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Build custom health questionnaires, spine pain assessments, and intake forms without coding.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('custom-forms.submissions')}
                            className="px-4 py-2.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 font-extrabold text-xs transition-all flex items-center gap-2"
                        >
                            <span>📥</span>
                            <span>Patient Submissions ({metrics.total_submissions})</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                        >
                            <span>✨ Build Custom Form</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Custom Form Builder" />

            <div className="space-y-8">
                {/* Top 4 KPI Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Forms */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Total Custom Forms</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                📋
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.total_forms}</h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Configured intake forms</p>
                        </div>
                    </div>

                    {/* Published Forms */}
                    <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-emerald-300">Published Active Forms</span>
                            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-lg border border-emerald-500/20">
                                ✅
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-emerald-300 font-mono tracking-tight">{metrics.published_count}</h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Available to patients</p>
                        </div>
                    </div>

                    {/* Drafts */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-indigo-300">Draft Templates</span>
                            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-lg border border-indigo-500/20">
                                📝
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.draft_count}</h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">In progress</p>
                        </div>
                    </div>

                    {/* Patient Submissions */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase font-mono text-purple-300">Intake Submissions</span>
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 text-lg border border-purple-500/20">
                                📥
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics.total_submissions}</h3>
                            <p className="text-xs text-gray-400 font-mono mt-1">Patient response records</p>
                        </div>
                    </div>
                </div>

                {/* Pre-built Starter Templates Section */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
                    <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>⚡ Pre-built Starter Intake Templates</span>
                            </h3>
                            <p className="text-xs text-gray-400">Clone and launch clinical questionnaires in 1 click.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {starterTemplates.map((tpl, idx) => (
                            <div
                                key={idx}
                                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-extrabold text-white">{tpl.title}</h4>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {tpl.fields.length} Fields
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{tpl.description}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleUseTemplate(tpl)}
                                    className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-extrabold text-xs transition-all border border-purple-500/30 flex items-center justify-center gap-2"
                                >
                                    <span>📋 Clone & Use Template</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Custom Forms Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                            <span>📋 Your Clinic Intake Forms ({forms.length})</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all space-y-5 flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                                                form.status === 'published'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                            }`}
                                        >
                                            {form.status}
                                        </span>

                                        <span className="text-xs text-purple-300 font-mono font-bold">
                                            📥 {form.submissions_count ?? 0} Submissions
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                            {form.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                            {form.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono text-gray-300">
                                        <span>Fields Configured:</span>
                                        <span className="font-bold text-white">{(form.fields || []).length} questions</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    <Link
                                        href={route('custom-forms.builder', form.id)}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <span>🛠️ Open Form Builder</span>
                                    </Link>

                                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => copyPublicLink(form.id)}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                                            title="Copy Patient Public Intake Link"
                                        >
                                            🔗 Share
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDuplicate(form)}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                                            title="Duplicate Form Template"
                                        >
                                            📋 Clone
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingForm(form)}
                                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors"
                                            title="Delete Form"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Form Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>✨ Create Custom Intake Form</span>
                            </h3>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Form Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Cervical Spine & Neck Intake Form"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Form Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Instructions for the patient when filling out this questionnaire..."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Launch Builder →
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4">
                        <h3 className="text-lg font-extrabold text-white">Delete Form '{deletingForm.title}'?</h3>
                        <p className="text-xs text-gray-400">This action cannot be undone. All dynamic field configurations will be removed.</p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setDeletingForm(null)} className="px-4 py-2 text-xs text-gray-400">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteSubmit} className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs">
                                Delete Form
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
