import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PainHistoryTimeline from '@/Components/PainHistoryTimeline';
import { PainPoint } from '@/Components/BodyPainDiagram';
import { Head, Link } from '@inertiajs/react';
import { Patient } from './Index';

interface AppointmentRecord {
    id: number;
    appointment_date: string;
    status: 'completed' | 'scheduled' | 'cancelled';
    service_type: string;
    chiropractor?: { name: string };
}

interface MedicalRecordItem {
    id: number;
    chief_complaint: string;
    pain_level: number;
    diagnosis: string | null;
    record_date: string;
    doctor?: { name: string };
    pain_diagram_data?: PainPoint[] | null;
}

interface TreatmentSessionRecord {
    id: number;
    treatment_type: string;
    session_date: string;
    adjustment_areas: string[] | null;
    doctor?: { name: string };
}

interface InvoiceRecord {
    id: number;
    invoice_number: string;
    issue_date: string;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
}

interface TreatmentPlanRecord {
    id: number;
    title: string;
    total_sessions: number;
    completed_sessions: number;
    completion_percentage: number;
    remaining_sessions: number;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    doctor?: { name: string };
}

interface ConsentFormRecord {
    id: number;
    form_type: string;
    title: string;
    signer_name: string | null;
    signature_url: string | null;
    signed_at: string | null;
    status: 'pending' | 'signed' | 'declined';
}

interface ShowProps {
    patient: Patient & {
        appointments: AppointmentRecord[];
        medicalRecords?: MedicalRecordItem[];
        treatmentSessions?: TreatmentSessionRecord[];
        treatmentPlans?: TreatmentPlanRecord[];
        consentForms?: ConsentFormRecord[];
        invoices?: InvoiceRecord[];
    };
}

export default function Show({ patient }: ShowProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('patients.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Patients
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Patient <span className="gradient-text">Dossier</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Medical records, treatment history, and billing invoices for {patient.full_name}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('booking.portal')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                    >
                        <span>⚡</span>
                        <span>Book Online Appointment</span>
                    </Link>
                </div>
            }
        >
            <Head title={`Patient Dossier - ${patient.full_name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Profile Card Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl text-center space-y-4">
                        <img
                            src={patient.profile_photo_url}
                            alt={patient.full_name}
                            className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-purple-500/40 shadow-xl"
                        />
                        <div>
                            <h2 className="text-2xl font-extrabold text-white">{patient.full_name}</h2>
                            <span className="text-xs text-purple-400 font-mono block mt-0.5">{patient.email}</span>
                        </div>

                        <div className="pt-2 flex justify-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    patient.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}
                            >
                                {patient.status} Care
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                                {patient.gender || 'Unspecified'}
                            </span>
                        </div>

                        <div className="pt-4 border-t border-white/10 text-left space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-gray-400 block uppercase font-semibold">Phone Number</span>
                                <span className="text-gray-200 font-mono">{patient.phone || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block uppercase font-semibold">Date of Birth</span>
                                <span className="text-gray-200">{patient.date_of_birth || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block uppercase font-semibold">Insurance Carrier</span>
                                <span className="text-purple-300 font-semibold">{patient.insurance || 'Self Pay'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact Card */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Emergency Contact (ICE)</h3>
                        <p className="text-sm font-semibold text-white">{patient.emergency_contact || 'None listed'}</p>
                    </div>
                </div>

                {/* Right History Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Interactive Body Pain History & Progression Timeline */}
                    <PainHistoryTimeline medicalRecords={patient.medicalRecords || []} />

                    {/* Invoices & Financial Billing History */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Billing Invoices & Receipts</h3>
                                <span className="text-xs text-purple-400">Patient invoice history & payment status</span>
                            </div>
                            <span className="text-xs text-purple-300 font-mono">
                                {patient.invoices?.length || 0} invoices
                            </span>
                        </div>

                        <div className="space-y-3">
                            {!patient.invoices || patient.invoices.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4 text-center">No invoices issued yet.</p>
                            ) : (
                                patient.invoices.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:border-purple-500/40 transition-colors"
                                    >
                                        <div>
                                            <span className="font-mono font-bold text-purple-300 text-sm block">
                                                {inv.invoice_number}
                                            </span>
                                            <span className="text-xs text-gray-400 block">
                                                Issue Date: {inv.issue_date} • Total: ${inv.total_amount.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                        : inv.status === 'partially_paid'
                                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                }`}
                                            >
                                                {inv.status.replace('_', ' ')}
                                            </span>

                                            <Link
                                                href={route('invoices.show', inv.id)}
                                                className="px-3 py-1.5 rounded-xl bg-white/5 text-purple-300 hover:bg-purple-600/20 text-xs font-bold transition-colors"
                                            >
                                                🖨️ Print PDF
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Prescribed Chiropractic Treatment Plans */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Prescribed Treatment Plans</h3>
                                <span className="text-xs text-purple-400">Multi-week care programs & completion status</span>
                            </div>
                            <span className="text-xs text-purple-300 font-mono">
                                {patient.treatmentPlans?.length || 0} plans
                            </span>
                        </div>

                        <div className="space-y-3">
                            {!patient.treatmentPlans || patient.treatmentPlans.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4 text-center">No treatment plans prescribed yet.</p>
                            ) : (
                                patient.treatmentPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/40 transition-colors"
                                    >
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-white text-sm block">
                                                    {plan.title}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-purple-500/20 text-purple-300 border-purple-500/30 uppercase font-mono">
                                                    {plan.status}
                                                </span>
                                            </div>

                                            {/* Mini Progress Bar */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-36 bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                                        style={{ width: `${plan.completion_percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-purple-300 font-mono font-bold">
                                                    {plan.completion_percentage}% ({plan.completed_sessions}/{plan.total_sessions} sessions)
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('treatment-plans.show', plan.id)}
                                            className="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 text-xs font-bold transition-colors shrink-0"
                                        >
                                            View Checklist →
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Digital Consent Forms & E-Signatures */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Digital Consent Forms & E-Signatures</h3>
                                <span className="text-xs text-purple-400">Intake documents, HIPAA privacy & signed authorizations</span>
                            </div>
                            <span className="text-xs text-purple-300 font-mono">
                                {patient.consentForms?.length || 0} documents
                            </span>
                        </div>

                        <div className="space-y-3">
                            {!patient.consentForms || patient.consentForms.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4 text-center">No digital consent forms issued yet.</p>
                            ) : (
                                patient.consentForms.map((cf) => (
                                    <div
                                        key={cf.id}
                                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/40 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-white text-sm block">
                                                    {cf.title}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase font-mono ${
                                                        cf.status === 'signed'
                                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                    }`}
                                                >
                                                    {cf.status === 'signed' ? '✓ Signed' : '⏱️ Pending'}
                                                </span>
                                            </div>

                                            <span className="text-xs text-gray-400 block font-mono">
                                                {cf.status === 'signed'
                                                    ? `Signed by ${cf.signer_name} on ${new Date(cf.signed_at!).toLocaleDateString()}`
                                                    : 'Awaiting patient electronic signature'}
                                            </span>
                                        </div>

                                        <Link
                                            href={route('consent-forms.show', cf.id)}
                                            className="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 text-xs font-bold transition-colors shrink-0"
                                        >
                                            {cf.status === 'signed' ? 'View Signature' : 'Sign Now'}
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Treatment Sessions Section */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Chiropractic Treatment Sessions</h3>
                                <span className="text-xs text-purple-400">Spinal region adjustments & care notes</span>
                            </div>
                            <span className="text-xs text-purple-300 font-mono">
                                {patient.treatmentSessions?.length || 0} sessions
                            </span>
                        </div>

                        <div className="space-y-3">
                            {!patient.treatmentSessions || patient.treatmentSessions.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4 text-center">No treatment sessions logged yet.</p>
                            ) : (
                                patient.treatmentSessions.map((sess) => (
                                    <div
                                        key={sess.id}
                                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-500/40 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <span className="font-extrabold text-white text-sm block">
                                                {sess.treatment_type}
                                            </span>
                                            <span className="text-[11px] text-gray-400 block font-mono">
                                                {new Date(sess.session_date).toLocaleString()} • {sess.doctor?.name}
                                            </span>
                                        </div>

                                        <Link
                                            href={route('treatment-sessions.show', sess.id)}
                                            className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 text-xs font-bold transition-colors shrink-0"
                                        >
                                            View Report
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
