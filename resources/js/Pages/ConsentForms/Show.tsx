import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SignaturePad from '@/Components/SignaturePad';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ConsentFormItem } from './Index';

interface ShowProps {
    consentForm: ConsentFormItem;
}

export default function Show({ consentForm }: ShowProps) {
    const patientName = consentForm.patient
        ? `${consentForm.patient.first_name} ${consentForm.patient.last_name}`
        : 'Patient';

    const [signatureData, setSignatureData] = useState<string | null>(consentForm.signature_data);

    const signForm = useForm({
        signer_name: consentForm.signer_name || patientName,
        signature_data: consentForm.signature_data || '',
    });

    const handleSignatureChange = (dataUrl: string | null) => {
        setSignatureData(dataUrl);
        signForm.setData('signature_data', dataUrl || '');
    };

    const handleSignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!signForm.data.signature_data) {
            alert('Please draw your electronic signature inside the signature box before submitting.');
            return;
        }

        signForm.post(route('consent-forms.sign', consentForm.id));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('consent-forms.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Consent Forms
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Digital Consent <span className="gradient-text">Document</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Official legal document for {patientName}.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2"
                    >
                        <span>🖨️</span>
                        <span>Print Document</span>
                    </button>
                </div>
            }
        >
            <Head title={`Digital Consent - ${consentForm.title}`} />

            <div className="max-w-4xl mx-auto space-y-8 print:p-0">
                {/* Header Document Banner */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl ring-2 ring-white/10 shrink-0">
                            ✍️
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-extrabold text-white">{consentForm.title}</h2>
                            <p className="text-xs text-purple-300 font-semibold">
                                Patient Name: {patientName} ({consentForm.patient?.email})
                            </p>
                            <span className="text-[11px] text-gray-400 font-mono block">
                                Form Type: <span className="capitalize">{consentForm.form_type.replace('_', ' ')}</span>
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <span
                            className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${
                                consentForm.status === 'signed'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                        >
                            {consentForm.status === 'signed' ? '✓ Signed & Verified' : '⏱️ Pending Signature'}
                        </span>
                    </div>
                </div>

                {/* Legal Document Text Viewer Box */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6 bg-slate-950/80">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-300">
                            Legal Terms & Consent Clauses
                        </h3>
                        <span className="text-xs text-gray-400 font-mono">Form ID #{consentForm.id}</span>
                    </div>

                    <div className="text-sm text-gray-200 leading-relaxed font-mono whitespace-pre-wrap space-y-4 p-5 rounded-2xl bg-black/40 border border-white/5 max-h-[380px] overflow-y-auto">
                        {consentForm.content}
                    </div>
                </div>

                {/* E-Signature Section */}
                {consentForm.status === 'signed' ? (
                    /* Signed & Verified Audit Seal Box */
                    <div className="glass-card rounded-3xl p-8 border border-emerald-500/40 shadow-2xl space-y-6 bg-emerald-950/20">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                            <h3 className="text-lg font-extrabold text-emerald-300 flex items-center gap-2">
                                <span>🛡️ Verified Electronic Signature Audit Record</span>
                            </h3>
                            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                                Legally Binding E-Sign
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-gray-400 uppercase font-semibold block text-[10px]">Signer Legal Name</span>
                                    <span className="text-base font-extrabold text-white">{consentForm.signer_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase font-semibold block text-[10px]">Signed Timestamp</span>
                                    <span className="text-sm text-emerald-300 font-mono font-bold">
                                        {new Date(consentForm.signed_at!).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase font-semibold block text-[10px]">Audit IP Address</span>
                                    <span className="text-sm text-gray-300 font-mono">{consentForm.ip_address || '127.0.0.1'}</span>
                                </div>
                            </div>

                            {/* Rendered Signature PNG Image Preview */}
                            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 text-center space-y-2">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Captured E-Signature</span>
                                {consentForm.signature_url ? (
                                    <img
                                        src={consentForm.signature_url}
                                        alt="Electronic Signature"
                                        className="max-h-24 mx-auto object-contain filter invert opacity-90"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Signature image stored</span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Interactive E-Signature Form Pad */
                    <form onSubmit={handleSignSubmit} className="glass-card rounded-3xl p-8 border border-purple-500/40 shadow-2xl space-y-6">
                        <div className="border-b border-white/10 pb-4">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>✍️ Patient Electronic Signature</span>
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Please review the legal clauses above and sign using mouse or touchscreen below.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
                                Signer Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={signForm.data.signer_name}
                                onChange={(e) => signForm.setData('signer_name', e.target.value)}
                                placeholder="Enter full legal name..."
                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-sm font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                                Draw Signature *
                            </label>
                            <SignaturePad
                                value={signatureData}
                                onChange={handleSignatureChange}
                                height={200}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                            <Link
                                href={route('consent-forms.index')}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={signForm.processing}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                            >
                                <span>✓</span>
                                <span>Submit Electronic Signature</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
