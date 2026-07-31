import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface ServiceItem {
    id: string;
    name: string;
    duration: number;
    icon: string;
    description: string;
}

interface DoctorItem {
    id: number;
    name: string;
    specialty: string;
    bio?: string;
    profile_photo_url?: string;
}

interface PatientItem {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

interface TimeSlot {
    time_24: string;
    formatted: string;
    available: boolean;
    reason: string;
}

interface BookingPortalProps {
    doctors: DoctorItem[];
    patients: PatientItem[];
    services: ServiceItem[];
}

export default function BookingPortal({ doctors, patients, services }: BookingPortalProps) {
    const [step, setStep] = useState<number>(1);
    const [selectedService, setSelectedService] = useState<ServiceItem>(services[0]);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem>(doctors[0]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
    const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

    const form = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        appointment_date: selectedDate,
        appointment_time: '',
        duration: services[0]?.duration || 30,
        status: 'scheduled',
        service_type: services[0]?.name || 'Spinal Adjustment',
        notes: '',
    });

    // Fetch available time slots whenever doctor or date changes
    useEffect(() => {
        if (!selectedDoctor?.id || !selectedDate) return;

        setIsLoadingSlots(true);
        setSelectedTimeSlot(null);

        fetch(`/appointments/available-slots?doctor_id=${selectedDoctor.id}&date=${selectedDate}`)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.slots) {
                    setSlots(data.slots);
                }
            })
            .catch((err) => console.error('Error fetching time slots:', err))
            .finally(() => setIsLoadingSlots(false));
    }, [selectedDoctor?.id, selectedDate]);

    const handleSelectService = (service: ServiceItem) => {
        setSelectedService(service);
        form.setData('service_type', service.name);
        form.setData('duration', service.duration);
    };

    const handleSelectDoctor = (doctor: DoctorItem) => {
        setSelectedDoctor(doctor);
        form.setData('doctor_id', doctor.id);
    };

    const handleSelectSlot = (slot: TimeSlot) => {
        if (!slot.available) return;
        setSelectedTimeSlot(slot.time_24);
        form.setData('appointment_time', slot.time_24);
    };

    const handleConfirmBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTimeSlot) {
            alert('Please select an available time slot before confirming your booking.');
            return;
        }

        form.setData('appointment_date', selectedDate);
        form.setData('doctor_id', selectedDoctor.id);

        form.post(route('appointments.store'), {
            onSuccess: () => {
                const code = `CHIR-${Math.floor(1000 + Math.random() * 9000)}`;
                setConfirmationCode(code);
                setStep(4); // Move to Confirmation Receipt screen
            },
        });
    };

    const activePatient = patients.find((p) => p.id === Number(form.data.patient_id));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('appointments.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Schedule
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Online Patient <span className="gradient-text">Booking Portal</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Select service, chiropractor, and real-time available time slots.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Online Appointment Booking" />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Stepper Progress Bar */}
                {step < 4 && (
                    <div className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                            <div className={`p-3 rounded-2xl border transition-all ${step >= 1 ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                1. Service & Doctor
                            </div>
                            <div className={`p-3 rounded-2xl border transition-all ${step >= 2 ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                2. Date & Time Slot
                            </div>
                            <div className={`p-3 rounded-2xl border transition-all ${step >= 3 ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                3. Confirm Booking
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 1: Select Service & Doctor */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Service Cards */}
                        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
                            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                <span>1. Select Chiropractic Service</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        onClick={() => handleSelectService(service)}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                                            selectedService.id === service.id
                                                ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/40 shadow-xl'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl">{service.icon}</span>
                                            <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                {service.duration} Mins
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-extrabold text-white">{service.name}</h4>
                                        <p className="text-xs text-gray-400">{service.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Doctor Selector */}
                        <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
                            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                <span>2. Select Attending Chiropractor</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {doctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        onClick={() => handleSelectDoctor(doctor)}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all text-center space-y-3 ${
                                            selectedDoctor.id === doctor.id
                                                ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/40 shadow-xl'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 mx-auto flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-white/10">
                                            🩺
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-extrabold text-white">{doctor.name}</h4>
                                            <span className="text-xs text-purple-300 font-mono block mt-0.5">
                                                {doctor.specialty}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                            >
                                <span>Continue to Date & Time Slots</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Select Date & Real-time Time Slots Grid */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                        <span>📅 Choose Date & Time Slot</span>
                                    </h3>
                                    <p className="text-xs text-purple-300">
                                        Dr. {selectedDoctor.name} • {selectedService.name} ({selectedService.duration} mins)
                                    </p>
                                </div>

                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-[#0b0f19] text-white rounded-xl px-4 py-2 border border-white/15 focus:border-purple-500 text-xs font-mono"
                                />
                            </div>

                            {/* Available Time Slots Grid */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                                        Available Time Slots on {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </h4>
                                    {isLoadingSlots && (
                                        <span className="text-xs text-purple-300 font-mono animate-pulse">
                                            Checking availability...
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.time_24}
                                            type="button"
                                            disabled={!slot.available}
                                            onClick={() => handleSelectSlot(slot)}
                                            className={`p-3 rounded-2xl text-xs font-extrabold font-mono border transition-all text-center ${
                                                selectedTimeSlot === slot.time_24
                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/40 ring-2 ring-purple-500/50'
                                                    : slot.available
                                                    ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer'
                                                    : 'bg-white/5 text-gray-500 border-white/5 opacity-50 cursor-not-allowed line-through'
                                            }`}
                                        >
                                            <span className="block">{slot.formatted}</span>
                                            <span className="text-[10px] font-normal block opacity-80 mt-0.5">
                                                {slot.available ? 'Available' : 'Booked'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                disabled={!selectedTimeSlot}
                                onClick={() => setStep(3)}
                                className={`px-6 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                                    selectedTimeSlot
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500'
                                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <span>Proceed to Confirmation</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Patient Selection & Final Confirmation */}
                {step === 3 && (
                    <form onSubmit={handleConfirmBooking} className="space-y-6 animate-fade-in">
                        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-6">
                            <div className="border-b border-white/10 pb-4">
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    <span>📋 Confirm Appointment Details</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Review booking summary and confirm patient details.
                                </p>
                            </div>

                            {/* Booking Summary Box */}
                            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400 uppercase font-semibold">Service Type:</span>
                                    <span className="text-white font-bold">{selectedService.name} ({selectedService.duration} mins)</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400 uppercase font-semibold">Attending Doctor:</span>
                                    <span className="text-purple-300 font-bold">{selectedDoctor.name} ({selectedDoctor.specialty})</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400 uppercase font-semibold">Scheduled Date & Time:</span>
                                    <span className="text-emerald-300 font-mono font-bold">
                                        {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ {slots.find((s) => s.time_24 === selectedTimeSlot)?.formatted}
                                    </span>
                                </div>
                            </div>

                            {/* Select Patient */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
                                    Select Patient Account *
                                </label>
                                <select
                                    value={form.data.patient_id}
                                    onChange={(e) => form.setData('patient_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3.5 border border-white/15 focus:border-purple-500 outline-none text-xs font-medium"
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                                    Appointment Notes / Symptoms (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    placeholder="Describe any specific spinal symptoms, neck pain, or injury notes..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-xl shadow-purple-600/40 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                            >
                                <span>✓</span>
                                <span>Confirm & Book Appointment</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 4: Instant Confirmation Receipt Screen */}
                {step === 4 && (
                    <div className="glass-card rounded-3xl p-8 border border-emerald-500/40 shadow-2xl text-center space-y-6 bg-emerald-950/20 animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl mx-auto border border-emerald-500/30 ring-8 ring-emerald-500/10">
                            ✓
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-extrabold text-white">Appointment Confirmed!</h2>
                            <p className="text-xs text-gray-300">
                                Your chiropractic session has been scheduled successfully.
                            </p>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30 mt-2">
                                Confirmation Code: {confirmationCode}
                            </span>
                        </div>

                        {/* Summary Receipt Box */}
                        <div className="max-w-md mx-auto p-5 rounded-2xl bg-black/50 border border-white/10 text-left space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-gray-400">Patient Name:</span>
                                <span className="text-white font-bold">{activePatient?.first_name} {activePatient?.last_name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-gray-400">Service:</span>
                                <span className="text-white font-bold">{selectedService.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-gray-400">Doctor:</span>
                                <span className="text-purple-300 font-bold">{selectedDoctor.name}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-400">Scheduled Date & Time:</span>
                                <span className="text-emerald-300 font-mono font-bold">
                                    {new Date(selectedDate).toLocaleDateString()} @ {slots.find((s) => s.time_24 === selectedTimeSlot)?.formatted}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10">
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setSelectedTimeSlot(null);
                                    setConfirmationCode(null);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors"
                            >
                                Book Another Session
                            </button>
                            <Link
                                href={route('appointments.index')}
                                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold shadow-md hover:bg-purple-500 transition-all"
                            >
                                View Calendar & Appointments →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
