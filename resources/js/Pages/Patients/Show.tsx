import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Patient } from './Index';

interface AppointmentRecord {
    id: number;
    appointment_date: string;
    status: 'completed' | 'scheduled' | 'cancelled';
    service_type: string;
    chiropractor?: { name: string };
}

interface ShowProps {
    patient: Patient & {
        appointments: AppointmentRecord[];
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
                                Detailed medical record and appointment history for {patient.full_name}.
                            </p>
                        </div>
                    </div>
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

                {/* Right Details & History Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Residential Address & Notes */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-white mb-2">Residential Address</h3>
                            <p className="text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                {patient.address || 'No physical address recorded.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-white mb-2">Clinical & Medical Notes</h3>
                            <p className="text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                                {patient.notes || 'No clinical notes recorded.'}
                            </p>
                        </div>
                    </div>

                    {/* Appointment History */}
                    <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Appointment History</h3>
                            <span className="text-xs text-purple-400 font-mono">
                                {patient.appointments?.length || 0} visits recorded
                            </span>
                        </div>

                        <div className="space-y-3">
                            {!patient.appointments || patient.appointments.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4 text-center">No appointment visits recorded yet.</p>
                            ) : (
                                patient.appointments.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                                    >
                                        <div>
                                            <span className="font-bold text-white text-sm block">
                                                {appt.service_type}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {appt.chiropractor?.name || 'Staff Chiropractor'} • {new Date(appt.appointment_date).toLocaleString()}
                                            </span>
                                        </div>

                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                                                appt.status === 'completed'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                    : appt.status === 'scheduled'
                                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                                            }`}
                                        >
                                            {appt.status}
                                        </span>
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
