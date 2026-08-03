import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';

export interface DocumentItem {
    id: number;
    document_number: string;
    document_type: 'medical_report' | 'sick_leave_certificate' | 'referral_letter' | 'treatment_summary' | 'pdf_invoice';
    title: string;
    issued_at: string;
    content_json: Record<string, any>;
    patient?: { id: number; first_name: string; last_name: string; email: string };
    doctor?: { id: number; name: string; specialty: string };
}

export interface PatientOption {
    id: number;
    first_name: string;
    last_name: string;
    dob: string;
    phone: string;
    email: string;
}

export interface DoctorOption {
    id: number;
    name: string;
    specialty: string;
}

interface IndexProps {
    documents: {
        data: DocumentItem[];
        links: any[];
    };
    patients: PatientOption[];
    doctors: DoctorOption[];
}

export default function Index({ documents, patients, doctors }: IndexProps) {
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<DocumentItem['document_type']>('sick_leave_certificate');

    // Generator Form State
    const docForm = useForm({
        document_type: 'sick_leave_certificate' as DocumentItem['document_type'],
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        title: '',
        issued_at: new Date().toISOString().split('T')[0],
        // Sick Leave Specific
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        leave_days: 3,
        diagnosis_summary: 'Acute Lumbar Radiculopathy & L4-L5 Muscle Spasm',
        fitness_remarks: 'Patient is recommended strict bed rest and spinal decompression therapy.',
        // Medical Report Specific
        chief_complaint: 'Persistent lower back pain radiating down left leg',
        clinical_findings: 'Severe bilateral paraspinal muscle tightness. Reduced lumbar flexion.',
        diagnosis: 'L5-S1 Disc Herniation with Sciatica',
        treatment_plan: '12 Weeks Spinal Decompression, Cold Laser Therapy, and Core Exercises.',
        // Referral Letter Specific
        referred_to: 'Dr. Robert Vance, Orthopedic Surgeon (City General Hospital)',
        referral_reason: 'Referred for specialist evaluation and MRI lumbar spine contrast scan.',
        // Treatment Summary Specific
        sessions_completed: 12,
        initial_pain: '8/10',
        final_pain: '2/10',
        outcome_remarks: 'Significant improvement in lumbar range of motion and pain reduction.',
        // Invoice Specific
        total_amount: 205.0,
        payment_status: 'Paid in Full ✓',
    });

    const openGeneratorForType = (type: DocumentItem['document_type']) => {
        setSelectedType(type);
        docForm.setData('document_type', type);

        const patientName = patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'Patient';
        let defaultTitle = `Medical Document - ${patientName}`;
        if (type === 'sick_leave_certificate') defaultTitle = `Sick Leave Certificate - ${patientName}`;
        if (type === 'medical_report') defaultTitle = `Clinical Diagnostic Report - ${patientName}`;
        if (type === 'referral_letter') defaultTitle = `Specialist Referral Letter - ${patientName}`;
        if (type === 'treatment_summary') defaultTitle = `Treatment & Rehabilitation Summary - ${patientName}`;
        if (type === 'pdf_invoice') defaultTitle = `Patient Official Statement & Invoice - ${patientName}`;

        docForm.setData('title', defaultTitle);
        setIsGeneratorModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct JSON content based on document type
        let contentJson: Record<string, any> = {};
        if (selectedType === 'sick_leave_certificate') {
            contentJson = {
                start_date: docForm.data.start_date,
                end_date: docForm.data.end_date,
                leave_days: docForm.data.leave_days,
                diagnosis_summary: docForm.data.diagnosis_summary,
                fitness_remarks: docForm.data.fitness_remarks,
            };
        } else if (selectedType === 'medical_report') {
            contentJson = {
                chief_complaint: docForm.data.chief_complaint,
                clinical_findings: docForm.data.clinical_findings,
                diagnosis: docForm.data.diagnosis,
                treatment_plan: docForm.data.treatment_plan,
            };
        } else if (selectedType === 'referral_letter') {
            contentJson = {
                referred_to: docForm.data.referred_to,
                referral_reason: docForm.data.referral_reason,
            };
        } else if (selectedType === 'treatment_summary') {
            contentJson = {
                sessions_completed: docForm.data.sessions_completed,
                initial_pain: docForm.data.initial_pain,
                final_pain: docForm.data.final_pain,
                outcome_remarks: docForm.data.outcome_remarks,
            };
        } else if (selectedType === 'pdf_invoice') {
            contentJson = {
                total_amount: docForm.data.total_amount,
                payment_status: docForm.data.payment_status,
                line_items: [
                    { description: 'Spinal Diagnostic Examination', amount: 120.0 },
                    { description: 'Chiropractic Adjustment Session', amount: 85.0 },
                ],
            };
        }

        router.post(
            route('documents.store'),
            {
                document_type: selectedType,
                patient_id: docForm.data.patient_id,
                doctor_id: docForm.data.doctor_id,
                title: docForm.data.title,
                issued_at: docForm.data.issued_at,
                content_json: contentJson,
            },
            {
                onSuccess: () => {
                    setIsGeneratorModalOpen(false);
                },
            }
        );
    };

    const handleDelete = (doc: DocumentItem) => {
        if (confirm(`Are you sure you want to delete document ${doc.document_number}?`)) {
            router.delete(route('documents.destroy', doc.id));
        }
    };

    const getTypeBadgeStyle = (type: string) => {
        switch (type) {
            case 'sick_leave_certificate':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'medical_report':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'referral_letter':
                return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            case 'treatment_summary':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            default:
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Clinical & Financial <span className="gradient-text">Document Generator</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Generate, customize, and export medical reports, sick leave certificates, referral letters, and invoices.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => openGeneratorForType('sick_leave_certificate')}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                        >
                            <span>📄 Generate Document</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Document Generator" />

            <div className="space-y-8">
                {/* 5 Template Launcher Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* 1. Medical Report */}
                    <div
                        onClick={() => openGeneratorForType('medical_report')}
                        className="glass-card rounded-3xl p-5 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all cursor-pointer space-y-3 group hover:scale-[1.02]"
                    >
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-300 text-2xl w-fit border border-purple-500/20">
                            📑
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-sm group-hover:text-purple-300 transition-colors">Medical Report</h3>
                            <p className="text-[11px] text-gray-400 mt-1">Diagnostic assessment & SOAP summary</p>
                        </div>
                    </div>

                    {/* 2. Sick Leave Certificate */}
                    <div
                        onClick={() => openGeneratorForType('sick_leave_certificate')}
                        className="glass-card rounded-3xl p-5 border border-white/10 hover:border-red-500/40 shadow-xl transition-all cursor-pointer space-y-3 group hover:scale-[1.02]"
                    >
                        <div className="p-3 rounded-2xl bg-red-500/10 text-red-300 text-2xl w-fit border border-red-500/20">
                            🏥
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-sm group-hover:text-red-300 transition-colors">Sick Leave</h3>
                            <p className="text-[11px] text-gray-400 mt-1">Medical absence certificate & days</p>
                        </div>
                    </div>

                    {/* 3. Referral Letter */}
                    <div
                        onClick={() => openGeneratorForType('referral_letter')}
                        className="glass-card rounded-3xl p-5 border border-white/10 hover:border-indigo-500/40 shadow-xl transition-all cursor-pointer space-y-3 group hover:scale-[1.02]"
                    >
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-300 text-2xl w-fit border border-indigo-500/20">
                            ✉️
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-sm group-hover:text-indigo-300 transition-colors">Referral Letter</h3>
                            <p className="text-[11px] text-gray-400 mt-1">Specialist consultant referral</p>
                        </div>
                    </div>

                    {/* 4. Treatment Summary */}
                    <div
                        onClick={() => openGeneratorForType('treatment_summary')}
                        className="glass-card rounded-3xl p-5 border border-white/10 hover:border-emerald-500/40 shadow-xl transition-all cursor-pointer space-y-3 group hover:scale-[1.02]"
                    >
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-300 text-2xl w-fit border border-emerald-500/20">
                            📋
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-sm group-hover:text-emerald-300 transition-colors">Treatment Summary</h3>
                            <p className="text-[11px] text-gray-400 mt-1">Care plan sessions & pain scores</p>
                        </div>
                    </div>

                    {/* 5. PDF Invoice */}
                    <div
                        onClick={() => openGeneratorForType('pdf_invoice')}
                        className="glass-card rounded-3xl p-5 border border-white/10 hover:border-amber-500/40 shadow-xl transition-all cursor-pointer space-y-3 group hover:scale-[1.02]"
                    >
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-300 text-2xl w-fit border border-amber-500/20">
                            💳
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">PDF Invoice</h3>
                            <p className="text-[11px] text-gray-400 mt-1">Financial receipt & line items</p>
                        </div>
                    </div>
                </div>

                {/* Generated Documents Library Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>📄 Generated Documents Library ({documents.data.length})</span>
                            </h3>
                            <p className="text-xs text-gray-400">Library of issued clinical certificates, reports, and invoices.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-purple-300 font-mono uppercase font-extrabold border-b border-white/10">
                                <tr>
                                    <th className="p-4">Document Serial</th>
                                    <th className="p-4">Document Type</th>
                                    <th className="p-4">Patient Name</th>
                                    <th className="p-4">Attending Doctor</th>
                                    <th className="p-4">Issued Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                                {documents.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No clinical documents generated yet.
                                        </td>
                                    </tr>
                                ) : (
                                    documents.data.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 font-black text-white">
                                                {doc.document_number}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getTypeBadgeStyle(doc.document_type)}`}>
                                                    {doc.document_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-white font-sans">
                                                {doc.patient ? `${doc.patient.first_name} ${doc.patient.last_name}` : 'N/A'}
                                            </td>
                                            <td className="p-4 text-purple-300 font-sans">
                                                {doc.doctor?.name || 'Dr. Specialist'}
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {doc.issued_at}
                                            </td>
                                            <td className="p-4 text-right font-sans">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('documents.show', doc.id)}
                                                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 font-bold transition-all"
                                                    >
                                                        View / Print 🖨️
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(doc)}
                                                        className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 font-bold transition-all"
                                                    >
                                                        Delete 🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Document Generator Modal */}
            {isGeneratorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>📄 Generate {selectedType.replace('_', ' ').toUpperCase()}</span>
                            </h3>
                            <button type="button" onClick={() => setIsGeneratorModalOpen(false)} className="text-gray-400 hover:text-white font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Select Patient *</label>
                                    <select
                                        value={docForm.data.patient_id}
                                        onChange={(e) => docForm.setData('patient_id', e.target.value)}
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
                                    <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Attending Doctor</label>
                                    <select
                                        value={docForm.data.doctor_id}
                                        onChange={(e) => docForm.setData('doctor_id', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    >
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.specialty})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Document Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={docForm.data.title}
                                    onChange={(e) => docForm.setData('title', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            {/* SICK LEAVE FIELDS */}
                            {selectedType === 'sick_leave_certificate' && (
                                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={docForm.data.start_date}
                                                onChange={(e) => docForm.setData('start_date', e.target.value)}
                                                className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={docForm.data.end_date}
                                                onChange={(e) => docForm.setData('end_date', e.target.value)}
                                                className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Total Days</label>
                                            <input
                                                type="number"
                                                value={docForm.data.leave_days}
                                                onChange={(e) => docForm.setData('leave_days', Number(e.target.value))}
                                                className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Diagnosis Summary</label>
                                        <input
                                            type="text"
                                            value={docForm.data.diagnosis_summary}
                                            onChange={(e) => docForm.setData('diagnosis_summary', e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Fitness Remarks & Restrictions</label>
                                        <textarea
                                            rows={2}
                                            value={docForm.data.fitness_remarks}
                                            onChange={(e) => docForm.setData('fitness_remarks', e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* MEDICAL REPORT FIELDS */}
                            {selectedType === 'medical_report' && (
                                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Chief Complaint</label>
                                        <input
                                            type="text"
                                            value={docForm.data.chief_complaint}
                                            onChange={(e) => docForm.setData('chief_complaint', e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Clinical Findings & Examination</label>
                                        <textarea
                                            rows={2}
                                            value={docForm.data.clinical_findings}
                                            onChange={(e) => docForm.setData('clinical_findings', e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Primary Diagnosis</label>
                                        <input
                                            type="text"
                                            value={docForm.data.diagnosis}
                                            onChange={(e) => docForm.setData('diagnosis', e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* REFERRAL LETTER FIELDS */}
                            {selectedType === 'referral_letter' && (
                                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Referred Specialist / Hospital</label>
                                        <input
                                            type="text"
                                            value={docForm.data.referred_to}
                                            onChange={(e) => docForm.setData('referred_to', e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Reason for Specialist Referral</label>
                                        <textarea
                                            rows={2}
                                            value={docForm.data.referral_reason}
                                            onChange={(e) => docForm.setData('referral_reason', e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button type="button" onClick={() => setIsGeneratorModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
                                    Generate & Issue Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
