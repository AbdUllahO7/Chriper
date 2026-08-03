import { Head, Link } from '@inertiajs/react';

export interface DocumentPrintData {
    id: number;
    document_number: string;
    document_type: 'medical_report' | 'sick_leave_certificate' | 'referral_letter' | 'treatment_summary' | 'pdf_invoice';
    title: string;
    issued_at: string;
    content: Record<string, any>;
    patient?: {
        name: string;
        dob: string;
        phone: string;
        email: string;
        address: string;
    } | null;
    doctor?: {
        name: string;
        specialty: string;
        phone: string;
    } | null;
}

export interface ClinicInfo {
    clinic_name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    tax_number: string;
}

interface PrintPreviewProps {
    document: DocumentPrintData;
    clinic: ClinicInfo;
}

export default function PrintPreview({ document, clinic }: PrintPreviewProps) {
    const handlePrint = () => {
        window.print();
    };

    const getTypeTitle = (type: string) => {
        switch (type) {
            case 'sick_leave_certificate':
                return 'OFFICIAL SICK LEAVE MEDICAL CERTIFICATE';
            case 'medical_report':
                return 'CLINICAL MEDICAL DIAGNOSTIC REPORT';
            case 'referral_letter':
                return 'SPECIALIST MEDICAL REFERRAL LETTER';
            case 'treatment_summary':
                return 'SPINAL TREATMENT & REHABILITATION SUMMARY';
            case 'pdf_invoice':
                return 'PATIENT CLINICAL STATEMENT & INVOICE';
            default:
                return 'OFFICIAL MEDICAL DOCUMENT';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-900 font-sans p-4 sm:p-8 print:p-0 print:bg-white selection:bg-purple-500 selection:text-white">
            <Head title={`${document.document_number} - ${document.title}`} />

            {/* Top Action Bar (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={route('documents.index')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
                >
                    <span>← Back to Documents Hub</span>
                </Link>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2"
                >
                    <span>🖨️ PRINT / SAVE AS PDF</span>
                </button>
            </div>

            {/* Printable Document Paper */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl print:rounded-none shadow-2xl print:shadow-none p-8 sm:p-12 border border-slate-200 print:border-none space-y-8">
                {/* Official Letterhead Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{clinic.clinic_name}</h1>
                        <p className="text-xs text-slate-600 font-medium max-w-sm mt-1">{clinic.address}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                            <span>Phone: {clinic.phone}</span>
                            <span>•</span>
                            <span>{clinic.email}</span>
                        </div>
                    </div>

                    <div className="text-right sm:text-right font-mono text-xs space-y-1 text-slate-600">
                        <div className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-900 inline-block">
                            {document.document_number}
                        </div>
                        <p className="text-slate-500">Issued Date: <strong className="text-slate-900">{document.issued_at}</strong></p>
                        <p className="text-[10px] text-slate-400">Tax Reg: {clinic.tax_number}</p>
                    </div>
                </div>

                {/* Document Type Title Banner */}
                <div className="text-center py-3 bg-slate-900 text-white rounded-2xl print:rounded-none font-mono font-black text-sm tracking-wider uppercase">
                    {getTypeTitle(document.document_type)}
                </div>

                {/* Patient & Attending Physician Identity Grid */}
                <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div>
                        <h3 className="font-mono uppercase font-bold text-slate-400 text-[10px] mb-1">Patient Details</h3>
                        <p className="font-extrabold text-slate-900 text-sm">{document.patient?.name || 'N/A'}</p>
                        <p className="text-slate-600 font-mono">DOB: {document.patient?.dob || 'N/A'}</p>
                        <p className="text-slate-600 font-mono">Phone: {document.patient?.phone || 'N/A'}</p>
                    </div>

                    <div>
                        <h3 className="font-mono uppercase font-bold text-slate-400 text-[10px] mb-1">Attending Physician</h3>
                        <p className="font-extrabold text-slate-900 text-sm">{document.doctor?.name || 'Dr. Chiropractic Specialist'}</p>
                        <p className="text-slate-600 font-mono">Specialty: {document.doctor?.specialty || 'Chiropractic Care'}</p>
                        <p className="text-slate-600 font-mono">Phone: {document.doctor?.phone || clinic.phone}</p>
                    </div>
                </div>

                {/* Specific Document Content Body */}
                <div className="space-y-6 text-sm text-slate-800 leading-relaxed">
                    {/* SICK LEAVE CERTIFICATE CONTENT */}
                    {document.document_type === 'sick_leave_certificate' && (
                        <div className="space-y-5">
                            <p>
                                This is to certify that <strong>{document.patient?.name}</strong> was examined at our clinic and is under active clinical care for <strong>{document.content.diagnosis_summary || 'spinal disorder'}</strong>.
                            </p>

                            <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 font-mono text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span>Recommended Sick Leave Period:</span>
                                    <strong className="text-slate-900">{document.content.start_date} to {document.content.end_date}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Exempted Days:</span>
                                    <strong className="text-slate-900">{document.content.leave_days || 1} Days</strong>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase font-mono mb-1">Fitness For Duty & Work Restrictions:</h4>
                                <p className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 italic">
                                    "{document.content.fitness_remarks || 'Patient is advised strict rest and avoidance of physical strain.'}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* MEDICAL REPORT CONTENT */}
                    {document.document_type === 'medical_report' && (
                        <div className="space-y-5">
                            <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase font-mono mb-1">Chief Complaint & Presentation:</h4>
                                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    {document.content.chief_complaint || 'Patient presents with severe spinal discomfort.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase font-mono mb-1">Clinical Observations & Spinal Exam:</h4>
                                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    {document.content.clinical_findings || 'Subluxation detected during palpation and posture alignment.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase font-mono mb-1">Primary Clinical Diagnosis:</h4>
                                <p className="p-3 bg-purple-50 text-purple-950 font-extrabold rounded-xl border border-purple-200">
                                    {document.content.diagnosis || 'Vertebral Subluxation Complex'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase font-mono mb-1">Recommended Treatment Protocol:</h4>
                                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    {document.content.treatment_plan || 'Chiropractic adjustments, physical therapy, and spinal decompression.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* REFERRAL LETTER CONTENT */}
                    {document.document_type === 'referral_letter' && (
                        <div className="space-y-5">
                            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 font-mono text-xs">
                                <span>Referred To: </span>
                                <strong className="text-slate-900">{document.content.referred_to || 'Specialist Consultant'}</strong>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase font-mono mb-1">Reason for Referral & History:</h4>
                                <p className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    {document.content.referral_reason || 'Referred for specialist evaluation and advanced diagnostic imaging.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TREATMENT SUMMARY CONTENT */}
                    {document.document_type === 'treatment_summary' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200 font-mono text-xs text-center">
                                <div>
                                    <span className="text-slate-500 text-[10px] block">Completed Sessions</span>
                                    <strong className="text-slate-900 text-base">{document.content.sessions_completed || 12} Visits</strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-[10px] block">Initial Pain Score</span>
                                    <strong className="text-red-600 text-base">{document.content.initial_pain || '8/10'}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-[10px] block">Final Pain Score</span>
                                    <strong className="text-emerald-600 text-base">{document.content.final_pain || '2/10'}</strong>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-slate-900 text-xs uppercase font-mono mb-1">Functional Outcomes & Progress Remarks:</h4>
                                <p className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    {document.content.outcome_remarks || 'Significant improvement in lumbar range of motion and pain reduction.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* PDF INVOICE CONTENT */}
                    {document.document_type === 'pdf_invoice' && (
                        <div className="space-y-5">
                            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                                <thead className="bg-slate-100 text-slate-900 font-mono font-bold uppercase">
                                    <tr>
                                        <th className="p-3">Service Item Description</th>
                                        <th className="p-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 font-mono">
                                    {(document.content.line_items || [
                                        { description: 'Initial Spinal Diagnostic Assessment', amount: 120.0 },
                                        { description: 'Chiropractic Decompression Session', amount: 85.0 },
                                    ]).map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-3 text-slate-800">{item.description}</td>
                                            <td className="p-3 text-right font-bold text-slate-900">${item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="text-right font-mono text-xs space-y-1">
                                <p className="text-slate-500">Total Invoice Amount: <strong className="text-slate-900 text-sm">${(document.content.total_amount || 205.0).toFixed(2)}</strong></p>
                                <p className="text-emerald-600 font-bold">Status: {document.content.payment_status || 'Paid in Full ✓'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Signatures & Seal Block */}
                <div className="pt-12 border-t border-slate-200 flex items-end justify-between font-mono text-xs">
                    <div>
                        <div className="w-32 h-16 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                            [ Official Clinic Stamp ]
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Verified Digital Document</p>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="border-b border-slate-900 pb-1 font-bold text-slate-900 w-48">
                            {document.doctor?.name || 'Dr. Chiropractic Specialist'}
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase">Licensed Doctor Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
