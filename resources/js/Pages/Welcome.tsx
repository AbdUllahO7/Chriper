import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface DemoAppointment {
    id: number;
    patientName: string;
    patientAvatar: string;
    doctorName: string;
    specialty: string;
    time: string;
    date: string;
    treatment: string;
    status: 'Confirmed' | 'Pending' | 'Completed' | 'In Session';
}

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string; canLogin?: boolean; canRegister?: boolean }>) {
    // Interactive Demo State for Clinic Appointments
    const [appointments, setAppointments] = useState<DemoAppointment[]>([
        {
            id: 1,
            patientName: 'Eleanor Vance',
            patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            doctorName: 'Dr. Robert Chen, D.C.',
            specialty: 'Spinal Alignment & Rehab',
            time: '09:30 AM',
            date: 'Today',
            treatment: 'Chiropractic Adjustment',
            status: 'In Session',
        },
        {
            id: 2,
            patientName: 'Marcus Sterling',
            patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            doctorName: 'Dr. Sarah Jenkins, M.D.',
            specialty: 'Orthopedic & Physical Therapy',
            time: '11:00 AM',
            date: 'Today',
            treatment: 'Post-Op Physical Therapy',
            status: 'Confirmed',
        },
        {
            id: 3,
            patientName: 'Sophia Martinez',
            patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            doctorName: 'Dr. Michael Vance, D.C.',
            specialty: 'Sports Injury Specialist',
            time: '02:15 PM',
            date: 'Today',
            treatment: 'Joint Mobility & EMR Checkup',
            status: 'Pending',
        },
    ]);

    // Demo Form Inputs
    const [patientNameInput, setPatientNameInput] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('Dr. Robert Chen, D.C.');
    const [selectedTreatment, setSelectedTreatment] = useState('Chiropractic Adjustment');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | 'Confirmed' | 'In Session' | 'Pending'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeModuleTab, setActiveModuleTab] = useState<'emr' | 'scheduling' | 'doctors' | 'billing' | 'reports'>('emr');

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleBookAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientNameInput.trim()) return;

        const newAppt: DemoAppointment = {
            id: Date.now(),
            patientName: patientNameInput.trim(),
            patientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            doctorName: selectedDoctor,
            specialty: selectedDoctor.includes('Chen') ? 'Spinal Alignment' : 'Physical Therapy',
            time: '03:45 PM',
            date: 'Today',
            treatment: selectedTreatment,
            status: 'Confirmed',
        };

        setAppointments([newAppt, ...appointments]);
        setPatientNameInput('');
        showToast(`✅ Appointment successfully scheduled for ${newAppt.patientName}!`);
    };

    const filteredAppointments = appointments.filter((appt) => {
        const matchesStatus = selectedStatusFilter === 'All' || appt.status === selectedStatusFilter;
        const matchesSearch =
            appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appt.treatment.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <>
            <Head title="PulseClinic - Modern Clinic & Patient Practice Management System" />

            <div className="min-h-screen bg-[#090d16] text-gray-100 relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
                {/* Background Ambient Lighting Glows */}
                <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-teal-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none"></div>

                {/* Floating Toast Notification */}
                {toastMessage && (
                    <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-sm font-semibold">
                        <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Navbar */}
                <header className="sticky top-0 z-50 glass-nav border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
                                <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 01-1.022-.547l-2.387-.477a2 2 0 01-1.562-2.348l.477-2.387a2 2 0 01.547-1.022l15.428-15.428a2 2 0 012.828 0l2.387 2.387a2 2 0 010 2.828l-15.428 15.428z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-extrabold tracking-tight">
                                    Pulse<span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Clinic</span>
                                </span>
                                <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400/80">Practice OS</span>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <nav className="flex items-center gap-4">
                            <a href="#features" className="hidden md:inline-block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Modules
                            </a>
                            <a href="#demo" className="hidden md:inline-block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Live EMR Demo
                            </a>

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:from-teal-400 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 active:scale-95 flex items-center gap-2"
                                >
                                    <span>Clinic Dashboard</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        Staff Portal Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-400 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 active:scale-95"
                                    >
                                        Register Clinic
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    <div className="text-center max-w-4xl mx-auto space-y-6">
                        {/* HIPAA Compliance Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-teal-500/30 text-teal-300 text-sm font-medium shadow-inner">
                            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-ping"></span>
                            <span>HIPAA Compliant • Patient EMR • Appointments • Invoicing</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
                            Next-Generation <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Clinic Practice Management
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-gray-400 font-normal leading-relaxed max-w-3xl mx-auto">
                            Empower your healthcare facility with an all-in-one clinical operating system. Seamlessly manage patient EMR records, doctor rosters, treatment sessions, and PDF invoicing.
                        </p>

                        {/* Action Buttons */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-bold text-lg hover:opacity-95 transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
                            >
                                <span>{auth.user ? 'Open Practice Dashboard' : 'Start Free Clinic Trial'}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <a
                                href="#demo"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-gray-300 hover:text-white font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Interactive EMR Demo</span>
                            </a>
                        </div>
                    </div>

                    {/* Clinic Metrics Grid */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        <div className="glass-card rounded-2xl p-5 text-center border border-white/10 hover:border-teal-500/40 transition-all">
                            <div className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">18,500+</div>
                            <div className="text-xs text-gray-400 mt-1 font-medium">Active Patient Records</div>
                        </div>
                        <div className="glass-card rounded-2xl p-5 text-center border border-white/10 hover:border-cyan-500/40 transition-all">
                            <div className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">99.8%</div>
                            <div className="text-xs text-gray-400 mt-1 font-medium">On-Time Appointment Rate</div>
                        </div>
                        <div className="glass-card rounded-2xl p-5 text-center border border-white/10 hover:border-blue-500/40 transition-all">
                            <div className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">$2.4M+</div>
                            <div className="text-xs text-gray-400 mt-1 font-medium">Processed Billing & Invoices</div>
                        </div>
                        <div className="glass-card rounded-2xl p-5 text-center border border-white/10 hover:border-teal-500/40 transition-all">
                            <div className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">&lt; 2 min</div>
                            <div className="text-xs text-gray-400 mt-1 font-medium">Avg Patient Check-in</div>
                        </div>
                    </div>

                    {/* Live Interactive Clinic EMR & Appointment Sandbox */}
                    <div id="demo" className="mt-20 max-w-4xl mx-auto scroll-mt-28">
                        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative">
                            {/* Window Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 mb-6 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    <span className="ml-2 text-xs font-mono text-gray-400">Clinic OS Live Interactive Preview</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-medium border border-teal-500/30">
                                        Live Patient Queue Simulator
                                    </span>
                                </div>
                            </div>

                            {/* Book Appointment Simulator Form */}
                            <form onSubmit={handleBookAppointment} className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                                <div className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Schedule New Patient Appointment Demo</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={patientNameInput}
                                        onChange={(e) => setPatientNameInput(e.target.value)}
                                        placeholder="Patient Name (e.g. John Doe)"
                                        className="bg-slate-900/80 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none placeholder:text-gray-500"
                                    />
                                    <select
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        className="bg-slate-900/80 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                    >
                                        <option value="Dr. Robert Chen, D.C.">Dr. Robert Chen, D.C. (Chiropractic)</option>
                                        <option value="Dr. Sarah Jenkins, M.D.">Dr. Sarah Jenkins, M.D. (Orthopedics)</option>
                                        <option value="Dr. Michael Vance, D.C.">Dr. Michael Vance, D.C. (Sports Rehab)</option>
                                    </select>
                                    <select
                                        value={selectedTreatment}
                                        onChange={(e) => setSelectedTreatment(e.target.value)}
                                        className="bg-slate-900/80 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                    >
                                        <option value="Chiropractic Adjustment">Chiropractic Adjustment</option>
                                        <option value="Post-Op Physical Therapy">Post-Op Physical Therapy</option>
                                        <option value="Spinal Decompression Session">Spinal Decompression Session</option>
                                        <option value="EMR Initial Intake & Diagnosis">EMR Initial Intake &amp; Diagnosis</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={!patientNameInput.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-500/20 active:scale-95"
                                    >
                                        Schedule Appointment
                                    </button>
                                </div>
                            </form>

                            {/* Search & Status Filters */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                                {/* Search */}
                                <div className="relative w-full sm:w-72">
                                    <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search patient, doctor, procedure..."
                                        className="w-full bg-slate-900/60 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none placeholder:text-gray-500"
                                    />
                                </div>

                                {/* Status Filters */}
                                <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                                    {(['All', 'In Session', 'Confirmed', 'Pending'] as const).map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => setSelectedStatusFilter(st)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                                selectedStatusFilter === st
                                                    ? 'bg-teal-600 text-white shadow-md'
                                                    : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Appointments Table List */}
                            <div className="space-y-3">
                                {filteredAppointments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No appointments matching your criteria.
                                    </div>
                                ) : (
                                    filteredAppointments.map((appt) => (
                                        <div
                                            key={appt.id}
                                            className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={appt.patientAvatar}
                                                    alt={appt.patientName}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30 shrink-0"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-gray-100">{appt.patientName}</span>
                                                        <span
                                                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                                                appt.status === 'In Session'
                                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                                    : appt.status === 'Confirmed'
                                                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                            }`}
                                                        >
                                                            {appt.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {appt.treatment} • <span className="text-teal-300 font-medium">{appt.doctorName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-400 self-end sm:self-auto">
                                                <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
                                                    <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{appt.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Clinic Modules Showcase */}
                    <div id="features" className="mt-32 max-w-6xl mx-auto scroll-mt-28">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold">
                                Comprehensive <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Clinic Modules</span>
                            </h2>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">
                                Everything required to run a modern, high-volume clinic practice efficiently.
                            </p>

                            {/* Module Tabs */}
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                                {[
                                    { id: 'emr', label: 'Patient EMR Records' },
                                    { id: 'scheduling', label: 'Appointment Engine' },
                                    { id: 'doctors', label: 'Doctor Rostering' },
                                    { id: 'billing', label: 'Invoices & Payments' },
                                    { id: 'reports', label: 'Analytics & Export' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveModuleTab(tab.id as any)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                            activeModuleTab === tab.id
                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                                                : 'glass-card text-gray-400 hover:text-white border border-white/10'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Module Active Tab Content */}
                        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
                            {activeModuleTab === 'emr' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Electronic Medical Records (EMR)</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Maintain structured clinical records, diagnostic notes, treatment histories, and PDF/image attachment uploads for every patient.
                                        </p>
                                        <ul className="space-y-2 text-xs text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Centralized Patient Profile & EMR Search
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Medical Record File Attachments & Scans
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Treatment Session Progress Logs
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-teal-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// MedicalRecordController.php</div>
                                        <div><span className="text-pink-400">public function</span> <span className="text-blue-300">store</span>(Request $request) {'{'}</div>
                                        <div className="pl-4 text-gray-300">$validated = $request-&gt;validate([</div>
                                        <div className="pl-8 text-green-300">'patient_id' =&gt; 'required|exists:patients,id',</div>
                                        <div className="pl-8 text-green-300">'diagnosis' =&gt; 'required|string',</div>
                                        <div className="pl-8 text-green-300">'treatment_notes' =&gt; 'nullable|string'</div>
                                        <div className="pl-4 text-gray-300">]);</div>
                                        <div className="pl-4 text-teal-400">MedicalRecord::create($validated);</div>
                                        <div>{'}'}</div>
                                    </div>
                                </div>
                            )}

                            {activeModuleTab === 'scheduling' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Smart Appointment Engine</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Schedule, reschedule, or cancel patient appointments with automated time-slot conflict detection and automated notifications.
                                        </p>
                                        <ul className="space-y-2 text-xs text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Instant Rescheduling & Status Updates
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> SMS/Email Patient Reminders
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-cyan-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// Appointment Engine</div>
                                        <div><span className="text-purple-400">Route::patch</span>(<span className="text-green-300">'appointments/{'{'}appointment{'}'}/reschedule'</span>,</div>
                                        <div className="pl-4 text-gray-300">[AppointmentController::class, <span className="text-yellow-300">'reschedule'</span>]);</div>
                                    </div>
                                </div>
                            )}

                            {activeModuleTab === 'doctors' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Practitioner & Staff Management</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Manage doctor profiles, specializations, consultation fees, and real-time active availability toggles.
                                        </p>
                                        <ul className="space-y-2 text-xs text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Real-Time Doctor Availability Toggles
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Multi-Specialty Department Organization
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-blue-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// Doctor Model</div>
                                        <div><span className="text-pink-400">public function</span> <span className="text-blue-300">appointments</span>(): HasMany</div>
                                        <div>{'{'}</div>
                                        <div className="pl-4 text-teal-300"><span className="text-pink-400">return</span> $this-&gt;hasMany(Appointment::class);</div>
                                        <div>{'}'}</div>
                                    </div>
                                </div>
                            )}

                            {activeModuleTab === 'billing' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Billing, Invoices &amp; Payments</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Generate invoices for treatments, record partial/full payments, track outstanding balances, and print PDF invoices.
                                        </p>
                                        <ul className="space-y-2 text-xs text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Automated Itemized Invoice Generation
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Print &amp; PDF Invoice Downloading
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-emerald-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// BillingController.php</div>
                                        <div><span className="text-purple-400">Route::post</span>(<span className="text-green-300">'/invoices/{'{'}invoice{'}'}/record-payment'</span>,</div>
                                        <div className="pl-4 text-gray-300">[BillingController::class, <span className="text-yellow-300">'recordPayment'</span>]);</div>
                                    </div>
                                </div>
                            )}

                            {activeModuleTab === 'reports' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Clinical Analytics & Export</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Monitor daily patient traffic, appointment completion rates, revenue metrics, and export data in CSV/PDF formats.
                                        </p>
                                        <ul className="space-y-2 text-xs text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Instant CSV &amp; PDF Financial Export
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-teal-400">✓</span> Patient Volume &amp; Doctor Productivity Analytics
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-amber-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// Report Export Controller</div>
                                        <div><span className="text-purple-400">Route::get</span>(<span className="text-green-300">'/reports/export/pdf'</span>,</div>
                                        <div className="pl-4 text-gray-300">[ReportController::class, <span className="text-yellow-300">'exportPdf'</span>]);</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Practitioner Testimonials */}
                    <div className="mt-32 max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold">
                                Trusted by <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Healthcare Leaders</span>
                            </h2>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">
                                Experience why doctors and clinic managers trust PulseClinic to run their daily practice operations.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="glass-card rounded-3xl p-8 border border-white/10 hover:border-teal-500/40 transition-all">
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {'★'.repeat(5)}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                                    "PulseClinic revolutionized our chiropractic practice. Scheduling appointments and recording treatment session notes is completely effortless!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                                        alt="Dr. Arthur Pendelton"
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/40"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-white">Dr. Arthur Pendelton, D.C.</div>
                                        <div className="text-xs text-gray-400">Chief Chiropractor</div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card rounded-3xl p-8 border border-white/10 hover:border-cyan-500/40 transition-all">
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {'★'.repeat(5)}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                                    "Our front desk check-in time dropped from 10 minutes to under 2 minutes. The PDF billing and payment tracking features are game changers."
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="https://images.unsplash.com/photo-1594824813566-7885a39788d3?w=150&auto=format&fit=crop&q=80"
                                        alt="Elena Rostova"
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/40"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-white">Elena Rostova</div>
                                        <div className="text-xs text-gray-400">Practice Administrator</div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card rounded-3xl p-8 border border-white/10 hover:border-blue-500/40 transition-all">
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {'★'.repeat(5)}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                                    "Having instant access to patient EMR history and treatment attachments right during consultations gives our clinical team maximum confidence."
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
                                        alt="Dr. David Thorne"
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/40"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-white">Dr. David Thorne, M.D.</div>
                                        <div className="text-xs text-gray-400">Orthopedic Surgeon</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Final CTA Banner */}
                    <div className="mt-32 max-w-5xl mx-auto">
                        <div className="relative rounded-3xl p-10 sm:p-16 overflow-hidden bg-gradient-to-r from-teal-950/80 via-cyan-950/70 to-slate-950 border border-teal-500/30 text-center shadow-2xl">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                                    <span>🔒 Enterprise Grade Encryption &amp; Role Security</span>
                                </div>
                                <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                                    Ready to modernize your clinic practice?
                                </h2>
                                <p className="text-gray-300 text-base sm:text-lg">
                                    Streamline appointment scheduling, electronic medical records, and billing with PulseClinic today.
                                </p>
                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href={auth.user ? route('dashboard') : route('register')}
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-bold text-lg hover:opacity-95 transition-all shadow-xl shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {auth.user ? 'Access Practice Dashboard' : 'Register Your Clinic Free'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/10 py-10 relative z-10 bg-[#090d16]/90 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p>© {new Date().getFullYear()} PulseClinic Practice OS. Powered by Laravel v{laravelVersion} (PHP v{phpVersion}).</p>
                        <div className="flex items-center gap-6 text-xs sm:text-sm">
                            <a href="https://laravel.com" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">Laravel Engine</a>
                            <a href="https://inertiajs.com" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">Inertia.js React</a>
                            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">Tailwind CSS</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
