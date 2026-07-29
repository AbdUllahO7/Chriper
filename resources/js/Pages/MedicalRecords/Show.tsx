import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { MedicalRecordItem } from './Index';

interface ShowProps {
    medicalRecord: MedicalRecordItem;
}

export default function Show({ medicalRecord }: ShowProps) {
    const patientName = medicalRecord.patient
        ? `${medicalRecord.patient.first_name} ${medicalRecord.patient.last_name}`
        : 'Patient';

    const getPainColor = (level: number) => {
        if (level <= 3) return 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/30';
        if (level <= 6) return 'from-amber-500 to-yellow-500 text-amber-400 border-amber-500/30';
        return 'from-red-600 to-rose-600 text-red-400 border-red-500/30';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('medical-records.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Records
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Clinical <span className="gradient-text">Medical Dossier</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Detailed 9-section diagnostic record for {patientName}.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Clinical Dossier - ${patientName}`} />

            <div className="space-y-8">
                {/* Dossier Header Banner */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl ring-2 ring-white/10">
                            📋
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-white">{patientName}</h2>
                            <span className="text-xs text-purple-400 font-mono block mt-0.5">
                                Exam Date: {new Date(medicalRecord.record_date).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 block mt-0.5">
                                Attending Doctor: {medicalRecord.doctor?.name || 'Staff Chiropractor'} ({medicalRecord.doctor?.specialty})
                            </span>
                        </div>
                    </div>

                    {/* 1-10 Pain Scale Visual Gauge Card */}
                    <div className={`p-4 rounded-2xl border glass-card text-center min-w-[200px] ${getPainColor(medicalRecord.pain_level)}`}>
                        <span className="text-xs font-bold uppercase tracking-wider block opacity-90">Pain Assessment Scale</span>
                        <div className="text-3xl font-black block my-1">
                            {medicalRecord.pain_level} <span className="text-sm font-normal text-gray-400">/ 10</span>
                        </div>
                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mt-2 border border-white/10">
                            <div
                                className={`h-full bg-gradient-to-r ${getPainColor(medicalRecord.pain_level).split(' ')[0]} ${getPainColor(medicalRecord.pain_level).split(' ')[1]}`}
                                style={{ width: `${(medicalRecord.pain_level / 10) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 9 Clinical Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Chief Complaint */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">1. Chief Complaint</h3>
                        <p className="text-sm text-gray-200 bg-white/[0.03] p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                            {medicalRecord.chief_complaint}
                        </p>
                    </div>

                    {/* 7. Diagnosis */}
                    <div className="glass-card rounded-3xl p-6 border border-purple-500/30 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">7. Clinical Diagnosis</h3>
                        <p className="text-sm text-white font-semibold bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 whitespace-pre-wrap">
                            {medicalRecord.diagnosis || 'No clinical diagnosis recorded.'}
                        </p>
                    </div>

                    {/* 3. Medical History */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">3. Medical History</h3>
                        <p className="text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                            {medicalRecord.medical_history || 'No prior medical history specified.'}
                        </p>
                    </div>

                    {/* 4. Current Medications */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">4. Current Medications</h3>
                        <p className="text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                            {medicalRecord.current_medications || 'None listed.'}
                        </p>
                    </div>

                    {/* 5. Allergies */}
                    <div className="glass-card rounded-3xl p-6 border border-red-500/20 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">5. Allergies</h3>
                        <p className="text-sm text-red-300 font-semibold bg-red-500/10 p-4 rounded-2xl border border-red-500/20 whitespace-pre-wrap">
                            {medicalRecord.allergies || 'No Known Drug Allergies (NKDA)'}
                        </p>
                    </div>

                    {/* 6. Physical Examination */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">6. Physical Examination Findings</h3>
                        <p className="text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                            {medicalRecord.physical_examination || 'No physical exam findings recorded.'}
                        </p>
                    </div>

                    {/* 8. Treatment Plan */}
                    <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">8. Treatment Plan</h3>
                        <p className="text-sm text-emerald-200 font-semibold bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 whitespace-pre-wrap">
                            {medicalRecord.treatment_plan || 'No treatment plan recorded.'}
                        </p>
                    </div>

                    {/* 9. Progress Notes */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">9. Progress & SOAP Notes</h3>
                        <p className="text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                            {medicalRecord.progress_notes || 'No progress notes recorded.'}
                        </p>
                    </div>
                </div>

                {/* Attachments Section (Images, PDFs, X-rays) */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white">Clinical File Attachments (Images, PDFs, X-rays)</h3>
                        <span className="text-xs text-purple-400 font-mono">
                            {medicalRecord.attachments?.length || 0} attached files
                        </span>
                    </div>

                    {!medicalRecord.attachments || medicalRecord.attachments.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">No files or radiology X-rays attached to this record.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {medicalRecord.attachments.map((att) => (
                                <div
                                    key={att.id}
                                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {att.file_type}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            {(att.file_size / 1024).toFixed(0)} KB
                                        </span>
                                    </div>

                                    <p className="text-xs font-semibold text-white truncate" title={att.file_name}>
                                        {att.file_name}
                                    </p>

                                    <a
                                        href={att.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 text-xs font-semibold transition-colors w-full justify-center"
                                    >
                                        <span>👁️ View File</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
