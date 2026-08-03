import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export interface SubmissionItem {
    id: number;
    custom_form_id: number;
    patient_id: number | null;
    submitted_by_name: string;
    submitted_by_email: string | null;
    response_data: Record<string, any>;
    status: 'pending' | 'reviewed' | 'archived';
    submitted_at: string;
    form?: { id: number; title: string; fields?: any[] } | null;
    patient?: { id: number; first_name: string; last_name: string } | null;
}

interface SubmissionsProps {
    submissions: {
        data: SubmissionItem[];
        links: any[];
    };
    forms: Array<{ id: number; title: string }>;
    patients: Array<{ id: number; first_name: string; last_name: string }>;
    filters: { custom_form_id: string; patient_id: string };
}

export default function Submissions({ submissions, forms, patients, filters }: SubmissionsProps) {
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
    const [formFilter, setFormFilter] = useState(filters.custom_form_id || '');
    const [patientFilter, setPatientFilter] = useState(filters.patient_id || '');

    const handleFilterChange = (newFormId: string, newPatientId: string) => {
        setFormFilter(newFormId);
        setPatientFilter(newPatientId);
        router.get(
            route('custom-forms.submissions'),
            { custom_form_id: newFormId, patient_id: newPatientId },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Patient Intake <span className="gradient-text">Submissions Review</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Review submitted digital questionnaires, pain assessments, and health forms.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('custom-forms.index')}
                            className="px-4 py-2.5 rounded-2xl bg-[#0b0f19] text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-all"
                        >
                            ← Manage Custom Forms
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Intake Submissions" />

            <div className="space-y-6">
                {/* Filter Bar */}
                <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div>
                            <label className="block text-[11px] font-bold uppercase text-purple-300 mb-1">Filter by Form</label>
                            <select
                                value={formFilter}
                                onChange={(e) => handleFilterChange(e.target.value, patientFilter)}
                                className="bg-[#0b0f19] text-white rounded-xl px-4 py-2 border border-white/15 text-xs"
                            >
                                <option value="">All Custom Forms</option>
                                {forms.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase text-purple-300 mb-1">Filter by Patient</label>
                            <select
                                value={patientFilter}
                                onChange={(e) => handleFilterChange(formFilter, e.target.value)}
                                className="bg-[#0b0f19] text-white rounded-xl px-4 py-2 border border-white/15 text-xs"
                            >
                                <option value="">All Patients</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.first_name} {p.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Submissions Registry Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                <tr>
                                    <th className="p-4">Form Title</th>
                                    <th className="p-4">Submitted By Patient</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Submission Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                {submissions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                                            No form submissions recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.data.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <span className="font-extrabold text-white block">
                                                    {sub.form?.title || 'Unknown Form'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-extrabold text-purple-300">
                                                {sub.patient ? `${sub.patient.first_name} ${sub.patient.last_name}` : sub.submitted_by_name}
                                            </td>
                                            <td className="p-4 font-mono text-gray-400">
                                                {sub.submitted_by_email || 'N/A'}
                                            </td>
                                            <td className="p-4 font-mono text-gray-400">
                                                {new Date(sub.submitted_at).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                                    Received
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSubmission(sub)}
                                                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 font-bold transition-colors"
                                                >
                                                    View Answers 👁️
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

            {/* View Submission Answers Modal Drawer */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/15 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-xl font-extrabold text-white">
                                    Intake Responses: {selectedSubmission.form?.title}
                                </h3>
                                <p className="text-xs text-purple-300 font-mono mt-0.5">
                                    Submitted by <span className="text-white font-bold">{selectedSubmission.submitted_by_name}</span> on{' '}
                                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="text-gray-400 hover:text-white font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Responses Answers Cards */}
                        <div className="space-y-4">
                            {Object.entries(selectedSubmission.response_data || {}).map(([fieldId, answer], idx) => (
                                <div key={fieldId} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 font-mono">
                                    <span className="text-[11px] font-bold uppercase text-purple-300 block">Question #{idx + 1} ({fieldId})</span>
                                    <p className="text-sm font-extrabold text-white">
                                        {Array.isArray(answer) ? answer.join(', ') : String(answer || 'No answer provided')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs"
                            >
                                Close Answers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
