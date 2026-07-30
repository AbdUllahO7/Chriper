import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { TreatmentSessionItem } from './Index';

interface ShowProps {
    treatmentSession: TreatmentSessionItem;
}

export default function Show({ treatmentSession }: ShowProps) {
    const patientName = treatmentSession.patient
        ? `${treatmentSession.patient.first_name} ${treatmentSession.patient.last_name}`
        : 'Patient';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('treatment-sessions.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Sessions
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Treatment Session <span className="gradient-text">Dossier</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Detailed chiropractic adjustment report for {patientName}.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Session Dossier - ${patientName}`} />

            <div className="space-y-8">
                {/* Session Header Banner */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl ring-2 ring-white/10">
                            🩺
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-white">{patientName}</h2>
                            <span className="text-xs text-purple-400 font-mono block mt-0.5">
                                Session Date: {new Date(treatmentSession.session_date).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 block mt-0.5">
                                Doctor: {treatmentSession.doctor?.name || 'Staff Chiropractor'} ({treatmentSession.doctor?.room_number})
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-right">
                        <span className="text-[11px] font-bold text-purple-300 uppercase block tracking-wider">Treatment Procedure</span>
                        <span className="text-lg font-extrabold text-white">{treatmentSession.treatment_type}</span>
                    </div>
                </div>

                {/* Adjusted Spinal Regions Section */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>🦴 Adjusted Spinal Regions & Joints</span>
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {treatmentSession.adjustment_areas && treatmentSession.adjustment_areas.length > 0 ? (
                            treatmentSession.adjustment_areas.map((area, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/40 text-xs font-bold font-mono shadow-md"
                                >
                                    ✓ {area}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-500">General spinal alignment session.</span>
                        )}
                    </div>
                </div>

                {/* Clinical Notes & Patient Recommendations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Clinical SOAP Notes */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-3">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>📝 Clinical SOAP Notes</span>
                        </h3>
                        <p className="text-sm text-gray-200 bg-white/[0.03] p-5 rounded-2xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                            {treatmentSession.notes || 'No clinical session notes recorded.'}
                        </p>
                    </div>

                    {/* Post-Session Patient Recommendations */}
                    <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 shadow-2xl space-y-3">
                        <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                            <span>💡 Patient Home Care Recommendations</span>
                        </h3>
                        <p className="text-sm text-emerald-100 font-medium bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 whitespace-pre-wrap leading-relaxed">
                            {treatmentSession.recommendations || 'No home care recommendations specified.'}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
