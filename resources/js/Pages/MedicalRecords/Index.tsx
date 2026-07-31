import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import BodyPainDiagram, { PainPoint } from '@/Components/BodyPainDiagram';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_url: string;
    file_type: 'image' | 'pdf' | 'xray';
    mime_type: string;
    file_size: number;
}

export interface MedicalRecordItem {
    id: number;
    patient_id: number;
    doctor_id: number;
    chief_complaint: string;
    pain_level: number;
    medical_history: string | null;
    current_medications: string | null;
    allergies: string | null;
    physical_examination: string | null;
    diagnosis: string | null;
    treatment_plan: string | null;
    progress_notes: string | null;
    record_date: string;
    pain_diagram_data?: PainPoint[] | null;
    patient?: { id: number; first_name: string; last_name: string; email: string };
    doctor?: { id: number; name: string; specialty: string };
    attachments?: Attachment[];
}

interface IndexProps {
    medicalRecords: MedicalRecordItem[];
    patients: Array<{ id: number; first_name: string; last_name: string }>;
    doctors: Array<{ id: number; name: string; specialty: string }>;
    filters: { search: string; patient_id: string };
}

export default function Index({ medicalRecords, patients, doctors, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [patientFilter, setPatientFilter] = useState(filters.patient_id || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState<MedicalRecordItem | null>(null);

    // Form for 9 Clinical Sections + Pain Diagram + Attachments
    const createForm = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        chief_complaint: '',
        pain_level: 5,
        medical_history: '',
        current_medications: '',
        allergies: '',
        physical_examination: '',
        diagnosis: '',
        treatment_plan: '',
        progress_notes: '',
        pain_diagram_data: [] as PainPoint[],
        attachments: [] as File[],
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('medical-records.index'), { search, patient_id: patientFilter }, { preserveState: true });
    };

    const handlePatientFilterChange = (pid: string) => {
        setPatientFilter(pid);
        router.get(route('medical-records.index'), { search, patient_id: pid }, { preserveState: true });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            createForm.setData('attachments', Array.from(e.target.files));
        }
    };

    const handleCreateRecord = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('medical-records.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const confirmDeleteRecord = () => {
        if (deletingRecord) {
            router.delete(route('medical-records.destroy', deletingRecord.id));
        }
    };

    const getPainBadgeClass = (level: number) => {
        if (level <= 3) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        if (level <= 6) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        return 'bg-red-500/20 text-red-300 border-red-500/30';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Medical <span className="gradient-text">Records</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Clinical case notes, 9 diagnostic sections, pain scale assessments, and radiology attachments.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>+ Create Clinical Record</span>
                    </button>
                </div>
            }
        >
            <Head title="Medical Records" />

            {/* Search & Filter Toolbar */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by chief complaint, diagnosis, or patient..."
                        className="w-full bg-[#0b0f19]/80 text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-purple-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={patientFilter}
                        onChange={(e) => handlePatientFilterChange(e.target.value)}
                        className="bg-[#0b0f19]/80 text-white text-xs font-semibold rounded-xl px-3 py-2.5 border border-white/10 focus:border-purple-500 outline-none"
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

            {/* Medical Records Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.03] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Chief Complaint & Diagnosis</th>
                                <th className="px-6 py-4">Pain Level</th>
                                <th className="px-6 py-4">Attachments</th>
                                <th className="px-6 py-4">Attending Doctor</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {medicalRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No clinical medical records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                medicalRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('medical-records.show', record.id)}
                                                className="font-bold text-white hover:text-purple-300 transition-colors block text-sm"
                                            >
                                                {record.patient ? `${record.patient.first_name} ${record.patient.last_name}` : 'N/A'}
                                            </Link>
                                            <span className="text-xs text-gray-400 font-mono">
                                                {new Date(record.record_date).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <span className="font-semibold text-gray-200 text-xs block truncate">
                                                {record.chief_complaint}
                                            </span>
                                            {record.diagnosis && (
                                                <span className="text-[11px] text-purple-300 font-medium truncate block mt-0.5">
                                                    Diagnosis: {record.diagnosis}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${getPainBadgeClass(
                                                    record.pain_level
                                                )}`}
                                            >
                                                Pain: {record.pain_level} / 10
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.attachments && record.attachments.length > 0 ? (
                                                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                                                    📎 {record.attachments.length} files (Images/PDF/X-ray)
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-300">
                                            {record.doctor?.name || 'Staff Chiropractor'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('medical-records.show', record.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-purple-300 hover:bg-purple-600/20 text-xs font-semibold transition-colors"
                                                >
                                                    View Dossier
                                                </Link>
                                                <button
                                                    onClick={() => setDeletingRecord(record)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                                                >
                                                    Delete
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

            {/* Custom Confirm Modal for Record Deletion */}
            <ConfirmModal
                isOpen={!!deletingRecord}
                title="Delete Medical Record"
                message="Are you sure you want to permanently delete this clinical medical record and all attached files?"
                confirmText="Delete Clinical Record"
                onConfirm={confirmDeleteRecord}
                onClose={() => setDeletingRecord(null)}
            />

            {/* Create Clinical Record Modal (9 Sections + File Upload) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-lg">
                    <div className="glass-card rounded-3xl max-w-5xl lg:max-w-6xl w-full max-h-[90vh] flex flex-col border border-white/15 shadow-2xl overflow-hidden animate-fade-in">
                        {/* Fixed Modal Header */}
                        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-slate-900/60 shrink-0">
                            <div>
                                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                    <span>Create Clinical Medical Record</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                        9 Sections + EHR Pain Diagram
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Record patient diagnosis, pain map assessments, medical history, and clinical file attachments.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-lg font-bold transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form onSubmit={handleCreateRecord} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                            {/* Patient & Doctor Selection Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
                                        Select Patient *
                                    </label>
                                    <select
                                        value={createForm.data.patient_id}
                                        onChange={(e) => createForm.setData('patient_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm font-medium"
                                    >
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.first_name} {p.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
                                        Attending Doctor / Chiropractor *
                                    </label>
                                    <select
                                        value={createForm.data.doctor_id}
                                        onChange={(e) => createForm.setData('doctor_id', Number(e.target.value))}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm font-medium"
                                    >
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.specialty})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 1. Chief Complaint & 2. Pain Level Assessment */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                                        1. Chief Complaint *
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={createForm.data.chief_complaint}
                                        onChange={(e) => createForm.setData('chief_complaint', e.target.value)}
                                        placeholder="Primary symptoms, onset date, or reason for visit..."
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3.5 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm resize-none"
                                    />
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                        <span className="text-amber-400">2. Overall Pain Level</span>
                                        <span className="text-white font-mono text-sm px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
                                            {createForm.data.pain_level} / 10
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={createForm.data.pain_level}
                                        onChange={(e) => createForm.setData('pain_level', Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                                        <span>1 (Mild)</span>
                                        <span>5 (Moderate)</span>
                                        <span>10 (Severe)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Body Pain Diagram Selector */}
                            <div className="space-y-2 pt-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                                    Interactive Body Pain Diagram (Anatomical Marker)
                                </label>
                                <BodyPainDiagram
                                    value={createForm.data.pain_diagram_data}
                                    onChange={(points) => createForm.setData('pain_diagram_data', points)}
                                />
                            </div>

                            {/* 3. Medical History & 4. Medications */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                                        3. Medical History
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.medical_history}
                                        onChange={(e) => createForm.setData('medical_history', e.target.value)}
                                        placeholder="Past surgeries, chronic spinal conditions..."
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                                        4. Current Medications
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.current_medications}
                                        onChange={(e) => createForm.setData('current_medications', e.target.value)}
                                        placeholder="Prescriptions, muscle relaxants, anti-inflammatories..."
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm resize-none"
                                    />
                                </div>
                            </div>

                            {/* 5. Allergies & 6. Physical Examination */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                                        5. Allergies
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.allergies}
                                        onChange={(e) => createForm.setData('allergies', e.target.value)}
                                        placeholder="e.g. Penicillin, Latex, NKDA"
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                                        6. Physical Examination Findings
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.physical_examination}
                                        onChange={(e) => createForm.setData('physical_examination', e.target.value)}
                                        placeholder="Range of motion, spinal palpation findings..."
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {/* 7. Diagnosis & 8. Treatment Plan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
                                        7. Clinical Diagnosis
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.diagnosis}
                                        onChange={(e) => createForm.setData('diagnosis', e.target.value)}
                                        placeholder="Subluxation, lumbar radiculopathy..."
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                                        8. Treatment Plan
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.treatment_plan}
                                        onChange={(e) => createForm.setData('treatment_plan', e.target.value)}
                                        placeholder="Spinal decompression, lumbar adjustments..."
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm resize-none"
                                    />
                                </div>
                            </div>

                            {/* 9. Progress Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                                    9. Progress & SOAP Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={createForm.data.progress_notes}
                                    onChange={(e) => createForm.setData('progress_notes', e.target.value)}
                                    placeholder="Patient response to initial session and follow-up plan..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm resize-none"
                                />
                            </div>

                            {/* File Attachments Upload Box (Images, PDFs, X-rays) */}
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                                    Upload Clinical Attachments (Images, PDFs, X-rays)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                                />
                                <span className="text-[11px] text-gray-400 block">
                                    Upload X-ray radiology scans, MRI reports (PDF), or clinical images (Max 10MB per file).
                                </span>
                            </div>

                            {/* Action Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/30"
                                >
                                    Save Clinical Medical Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
