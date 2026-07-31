import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface DiagnosticAttachment {
    id: number;
    title: string;
    type: 'X-Ray' | 'MRI Scan' | 'Lab Result';
    date: string;
    fileSize: string;
    imageUrl: string;
    summary: string;
}

interface PatientEHR {
    id: number;
    patientName: string;
    patientAvatar: string;
    age: number;
    gender: string;
    bloodType: string;
    mrn: string; // Medical Record Number
    primaryDoctor: string;
    allergies: { name: string; severity: 'High' | 'Moderate' | 'Low' }[];
    medications: { name: string; dosage: string; frequency: string }[];
    diagnoses: { code: string; condition: string; date: string }[];
    previousTreatments: { procedure: string; doctor: string; date: string; outcome: string }[];
    historyTimeline: { date: string; title: string; notes: string; doctor: string }[];
    attachments: DiagnosticAttachment[];
}

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string; canLogin?: boolean; canRegister?: boolean }>) {
    // Sample Interactive EHR Patient Database
    const [patients] = useState<PatientEHR[]>([
        {
            id: 1,
            patientName: 'Eleanor Vance',
            patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            age: 38,
            gender: 'Female',
            bloodType: 'A+',
            mrn: 'EHR-882049',
            primaryDoctor: 'Dr. Robert Chen, D.C.',
            allergies: [
                { name: 'Penicillin', severity: 'High' },
                { name: 'NSAIDs (Aspirin)', severity: 'Moderate' },
                { name: 'Latex', severity: 'Low' },
            ],
            medications: [
                { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily post meals' },
                { name: 'Cyclobenzaprine', dosage: '10mg', frequency: 'At bedtime as needed' },
                { name: 'Vitamin D3 Supplement', dosage: '5000 IU', frequency: 'Daily morning' },
            ],
            diagnoses: [
                { code: 'M54.5', condition: 'L4-L5 Lumbar Disc Herniation', date: '2026-01-15' },
                { code: 'M54.2', condition: 'Cervical Radiculopathy', date: '2025-11-04' },
                { code: 'M62.83', condition: 'Paraspinal Muscle Spasm', date: '2025-08-22' },
            ],
            previousTreatments: [
                { procedure: 'Spinal Decompression Therapy', doctor: 'Dr. Robert Chen, D.C.', date: '2026-02-10', outcome: '70% Pain Reduction' },
                { procedure: 'Cervical Spine Adjustment', doctor: 'Dr. Robert Chen, D.C.', date: '2026-01-20', outcome: 'Improved Mobility' },
                { procedure: 'Myofascial Trigger Point Release', doctor: 'Dr. Sarah Jenkins, M.D.', date: '2025-12-05', outcome: 'Spasm Relieved' },
            ],
            historyTimeline: [
                { date: 'Feb 10, 2026', title: 'Treatment Session #4', notes: 'Patient reports significant mobility improvement. Pain score reduced from 7/10 to 3/10.', doctor: 'Dr. Robert Chen' },
                { date: 'Jan 15, 2026', title: 'Initial Consultation & Diagnostic Imaging', notes: 'Ordered lumbar MRI scan due to persistent lower back pain radiating down right leg.', doctor: 'Dr. Robert Chen' },
                { date: 'Nov 04, 2025', title: 'Emergency Intake - Neck Stiffness', notes: 'Prescribed muscle relaxants and gentle neck immobilization collar.', doctor: 'Dr. Sarah Jenkins' },
            ],
            attachments: [
                {
                    id: 101,
                    title: 'Lumbar Spine High-Res MRI Scan',
                    type: 'MRI Scan',
                    date: 'Jan 16, 2026',
                    fileSize: '14.2 MB',
                    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
                    summary: 'L4-L5 posterior disc protrusion compressing the nerve root. No caudal equine compression.',
                },
                {
                    id: 102,
                    title: 'Full Spine Digital X-Ray Series',
                    type: 'X-Ray',
                    date: 'Jan 15, 2026',
                    fileSize: '8.5 MB',
                    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
                    summary: 'Mild loss of lumbar lordosis. Intervertebral disc space narrowing at L4-L5.',
                },
                {
                    id: 103,
                    title: 'Complete Inflammatory & Metabolic Blood Panel',
                    type: 'Lab Result',
                    date: 'Jan 17, 2026',
                    fileSize: '2.1 MB',
                    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
                    summary: 'ESR: 12 mm/hr (Normal). hs-CRP: 1.4 mg/L (Mildly elevated). Vitamin D: 32 ng/mL.',
                },
            ],
        },
        {
            id: 2,
            patientName: 'Marcus Sterling',
            patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            age: 45,
            gender: 'Male',
            bloodType: 'O+',
            mrn: 'EHR-993102',
            primaryDoctor: 'Dr. Michael Vance, D.C.',
            allergies: [
                { name: 'Sulfa Drugs', severity: 'High' },
                { name: 'Codeine', severity: 'High' },
            ],
            medications: [
                { name: 'Naproxen Sodium', dosage: '500mg', frequency: 'As needed for joint inflammation' },
                { name: 'Omega-3 Fish Oil', dosage: '2000mg', frequency: 'Daily morning' },
            ],
            diagnoses: [
                { code: 'M17.11', condition: 'Right Knee Post-Traumatic Osteoarthritis', date: '2025-09-10' },
                { code: 'S83.2', condition: 'Medial Meniscus Tear (Repaired)', date: '2025-06-18' },
            ],
            previousTreatments: [
                { procedure: 'Arthroscopic Meniscus Repair', doctor: 'Dr. Michael Vance, D.C.', date: '2025-06-25', outcome: 'Surgical Success' },
                { procedure: 'Targeted Hydrotherapy & Flexion Exercises', doctor: 'Dr. Michael Vance, D.C.', date: '2025-10-12', outcome: '90% Range Recovered' },
            ],
            historyTimeline: [
                { date: 'Dec 18, 2025', title: '6-Month Post-Op Checkup', notes: 'Full weight-bearing achieved. Zero swelling in right knee joint.', doctor: 'Dr. Michael Vance' },
                { date: 'Oct 12, 2025', title: 'Hydrotherapy Evaluation', notes: 'Completed 12 sessions of aquatic physical therapy.', doctor: 'Dr. Michael Vance' },
            ],
            attachments: [
                {
                    id: 201,
                    title: 'Right Knee Joint 3D MRI Scan',
                    type: 'MRI Scan',
                    date: 'Jun 20, 2025',
                    fileSize: '18.7 MB',
                    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
                    summary: 'Grade 3 medial meniscus posterior horn tearing. Intact anterior/posterior cruciate ligaments.',
                },
                {
                    id: 202,
                    title: 'Post-Op Knee X-Ray Alignment Scan',
                    type: 'X-Ray',
                    date: 'Jul 05, 2025',
                    fileSize: '6.4 MB',
                    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
                    summary: 'Proper joint space restoration. No signs of osteophyte progression.',
                },
            ],
        },
        {
            id: 3,
            patientName: 'Sophia Martinez',
            patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            age: 29,
            gender: 'Female',
            bloodType: 'B-',
            mrn: 'EHR-774019',
            primaryDoctor: 'Dr. Sarah Jenkins, M.D.',
            allergies: [
                { name: 'Ciprofloxacin', severity: 'Moderate' },
            ],
            medications: [
                { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 8 hours as needed' },
                { name: 'Magnesium Glycinate', dosage: '400mg', frequency: 'Nightly' },
            ],
            diagnoses: [
                { code: 'M54.12', condition: 'Cervical Spine Strain & Whiplash', date: '2026-02-01' },
            ],
            previousTreatments: [
                { procedure: 'Cervical Traction Session', doctor: 'Dr. Sarah Jenkins, M.D.', date: '2026-02-05', outcome: 'Symptom Relief' },
            ],
            historyTimeline: [
                { date: 'Feb 05, 2026', title: 'Cervical Spine Adjustment', notes: 'Restored C4-C6 spinal alignment. Patient reported immediate headache relief.', doctor: 'Dr. Sarah Jenkins' },
            ],
            attachments: [
                {
                    id: 301,
                    title: 'Cervical Spine Multi-Angle X-Ray Series',
                    type: 'X-Ray',
                    date: 'Feb 02, 2026',
                    fileSize: '7.9 MB',
                    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
                    summary: 'Straightening of cervical curve secondary to muscle spasm. No bone fracture detected.',
                },
                {
                    id: 302,
                    title: 'Comprehensive Electrolyte & Lab Panel',
                    type: 'Lab Result',
                    date: 'Feb 03, 2026',
                    fileSize: '1.8 MB',
                    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
                    summary: 'Sodium: 140 mEq/L, Potassium: 4.2 mEq/L, Magnesium: 2.1 mg/dL (All within optimal ranges).',
                },
            ],
        },
    ]);

    // Active EHR States
    const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
    const [activeEhrTab, setActiveEhrTab] = useState<'summary' | 'diagnoses' | 'medications' | 'imaging'>('summary');
    const [selectedAttachmentFilter, setSelectedAttachmentFilter] = useState<'All' | 'X-Ray' | 'MRI Scan' | 'Lab Result'>('All');
    const [previewModalAttachment, setPreviewModalAttachment] = useState<DiagnosticAttachment | null>(null);
    const [searchEhrQuery, setSearchEhrQuery] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeModuleTab, setActiveModuleTab] = useState<'emr' | 'scheduling' | 'doctors' | 'billing' | 'reports'>('emr');

    const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const filteredAttachments = activePatient.attachments.filter((att) => {
        const matchesType = selectedAttachmentFilter === 'All' || att.type === selectedAttachmentFilter;
        const matchesQuery =
            att.title.toLowerCase().includes(searchEhrQuery.toLowerCase()) ||
            att.summary.toLowerCase().includes(searchEhrQuery.toLowerCase()) ||
            att.type.toLowerCase().includes(searchEhrQuery.toLowerCase());
        return matchesType && matchesQuery;
    });

    return (
        <>
            <Head title="PulseClinic - Electronic Health Records (EHR) & Practice OS" />

            <div className="min-h-screen bg-[#070b12] text-gray-100 relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
                {/* Background Ambient Lighting Glows */}
                <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-teal-600/15 rounded-full blur-[170px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[170px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute bottom-10 left-1/3 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[170px] pointer-events-none"></div>

                {/* Floating Toast Notification */}
                {toastMessage && (
                    <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-sm font-semibold">
                        <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Image / Diagnostic Viewer Modal */}
                {previewModalAttachment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                        <div className="glass-card max-w-3xl w-full rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
                            <button
                                onClick={() => setPreviewModalAttachment(null)}
                                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-mono uppercase">
                                    {previewModalAttachment.type}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">{previewModalAttachment.date}</span>
                                <span className="text-xs text-gray-500 font-mono">({previewModalAttachment.fileSize})</span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3">{previewModalAttachment.title}</h3>

                            <div className="rounded-2xl overflow-hidden mb-5 border border-white/10 max-h-[350px]">
                                <img
                                    src={previewModalAttachment.imageUrl}
                                    alt={previewModalAttachment.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">Radiologist / Diagnostic Clinical Findings:</span>
                                <p className="text-sm text-gray-300 leading-relaxed">{previewModalAttachment.summary}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navbar */}
                <header className="sticky top-0 z-40 glass-nav border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
                                <div className="w-full h-full bg-[#070b12] rounded-[14px] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-extrabold tracking-tight">
                                    Pulse<span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Clinic</span>
                                </span>
                                <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400/80">EHR Suite &amp; Practice OS</span>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <nav className="flex items-center gap-4">
                            <a href="#ehr-demo" className="hidden md:inline-block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Interactive EHR Chart
                            </a>
                            <a href="#modules" className="hidden md:inline-block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Clinic Modules
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
                                        Staff Login
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
                        {/* EHR Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-teal-500/30 text-teal-300 text-sm font-medium shadow-inner">
                            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-ping"></span>
                            <span>Comprehensive Electronic Health Records (EHR) Platform</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
                            Complete Patient History &amp; <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Diagnostic EHR Intelligence
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-gray-400 font-normal leading-relaxed max-w-3xl mx-auto">
                            Manage complete patient medical histories, previous diagnoses, treatments, allergies, active medications, uploaded X-rays, MRI scans, and lab reports in one unified clinical interface.
                        </p>

                        {/* Action Buttons */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-bold text-lg hover:opacity-95 transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
                            >
                                <span>{auth.user ? 'Open Clinical EHR Dashboard' : 'Explore EHR Features Free'}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <a
                                href="#ehr-demo"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-gray-300 hover:text-white font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>View Live Patient EHR Chart</span>
                            </a>
                        </div>
                    </div>

                    {/* 8 Core EHR Capabilities Banner Grid */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-teal-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
                                📜
                            </div>
                            <h4 className="text-sm font-bold text-white">Patient History</h4>
                            <p className="text-xs text-gray-400 mt-1">Chronological consultation &amp; visit progress notes.</p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-cyan-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                                🩺
                            </div>
                            <h4 className="text-sm font-bold text-white">Previous Diagnoses</h4>
                            <p className="text-xs text-gray-400 mt-1">ICD-10 clinical coding &amp; condition tracking.</p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-blue-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                                💆
                            </div>
                            <h4 className="text-sm font-bold text-white">Previous Treatments</h4>
                            <p className="text-xs text-gray-400 mt-1">Therapy sessions, surgeries &amp; procedure outcomes.</p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-red-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
                                ⚠️
                            </div>
                            <h4 className="text-sm font-bold text-white">Allergies &amp; Alerts</h4>
                            <p className="text-xs text-gray-400 mt-1">Drug sensitivity flags &amp; severity risk alerts.</p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-purple-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                                💊
                            </div>
                            <h4 className="text-sm font-bold text-white">Active Medications</h4>
                            <p className="text-xs text-gray-400 mt-1">Prescription dosages &amp; treatment frequency.</p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-emerald-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                                🦴
                            </div>
                            <h4 className="text-sm font-bold text-white">Uploaded X-rays</h4>
                            <p className="text-xs text-gray-400 mt-1">Digital radiography files &amp; radiological notes.</p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-teal-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
                                🧠
                            </div>
                            <h4 className="text-sm font-bold text-white">MRI Scans</h4>
                            <p className="text-xs text-gray-400 mt-1">High-resolution soft tissue &amp; spinal MRIs.</p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-amber-500/40 transition-all">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                                🧪
                            </div>
                            <h4 className="text-sm font-bold text-white">Lab Results</h4>
                            <p className="text-xs text-gray-400 mt-1">Bloodwork panels, markers &amp; pathology lab reports.</p>
                        </div>
                    </div>

                    {/* LIVE INTERACTIVE EHR PATIENT CHART SUITE */}
                    <div id="ehr-demo" className="mt-20 max-w-5xl mx-auto scroll-mt-28">
                        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative">
                            {/* Header / Patient Switcher */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 mb-6 gap-4">
                                <div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Interactive Clinical Demonstration</span>
                                    <h2 className="text-2xl font-bold text-white mt-0.5">Live Electronic Health Record (EHR) Viewer</h2>
                                </div>

                                {/* Patient Selection Buttons */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                                    {patients.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPatientId(p.id);
                                                showToast(`Loaded complete EHR chart for ${p.patientName}`);
                                            }}
                                            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                                                selectedPatientId === p.id
                                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25 ring-1 ring-white/30'
                                                    : 'bg-slate-900/60 text-gray-300 hover:text-white border border-white/10'
                                            }`}
                                        >
                                            <img src={p.patientAvatar} alt={p.patientName} className="w-6 h-6 rounded-full object-cover" />
                                            <span>{p.patientName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Patient Summary Header Box */}
                            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={activePatient.patientAvatar}
                                        alt={activePatient.patientName}
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-teal-500/50 shadow-md"
                                    />
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-white">{activePatient.patientName}</h3>
                                            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                                MRN: {activePatient.mrn}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                                            <span>{activePatient.age} Yrs Old</span>
                                            <span>•</span>
                                            <span>{activePatient.gender}</span>
                                            <span>•</span>
                                            <span className="text-red-400 font-semibold">Blood: {activePatient.bloodType}</span>
                                            <span>•</span>
                                            <span>Primary Doctor: <strong className="text-gray-200">{activePatient.primaryDoctor}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* EHR Navigation Tabs */}
                            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                {[
                                    { id: 'summary', label: '📜 Patient History & Visits' },
                                    { id: 'diagnoses', label: '🩺 Diagnoses & Treatments' },
                                    { id: 'medications', label: '💊 Medications & Allergies' },
                                    { id: 'imaging', label: '🦴 X-Rays, MRI & Labs' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveEhrTab(tab.id as any)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                            activeEhrTab === tab.id
                                                ? 'bg-teal-600 text-white shadow-md'
                                                : 'glass-card text-gray-400 hover:text-gray-200 border border-white/10'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* TAB 1: PATIENT HISTORY & VISITS */}
                            {activeEhrTab === 'summary' && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-teal-300 uppercase tracking-wider">Chronological Patient Visit History:</h4>
                                    <div className="relative pl-6 border-l-2 border-teal-500/30 space-y-6">
                                        {activePatient.historyTimeline.map((item, idx) => (
                                            <div key={idx} className="relative group">
                                                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-teal-500 ring-4 ring-[#070b12]" />
                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/30 transition-all space-y-1">
                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        <span className="font-mono font-semibold text-teal-300">{item.date}</span>
                                                        <span>Attending: {item.doctor}</span>
                                                    </div>
                                                    <h5 className="font-bold text-sm text-gray-100">{item.title}</h5>
                                                    <p className="text-xs text-gray-300 leading-relaxed">{item.notes}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: DIAGNOSES & TREATMENTS */}
                            {activeEhrTab === 'diagnoses' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Previous Diagnoses */}
                                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                                            <span>🩺</span>
                                            <span>Diagnoses History (ICD-10)</span>
                                        </div>
                                        <div className="space-y-3">
                                            {activePatient.diagnoses.map((diag, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                                                            {diag.code}
                                                        </span>
                                                        <span className="text-[11px] text-gray-500">{diag.date}</span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-200">{diag.condition}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Previous Treatments */}
                                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-teal-300">
                                            <span>💆</span>
                                            <span>Previous Treatments &amp; Procedures</span>
                                        </div>
                                        <div className="space-y-3">
                                            {activePatient.previousTreatments.map((treat, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-teal-300">{treat.procedure}</span>
                                                        <span className="text-[11px] text-gray-500">{treat.date}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        <span>{treat.doctor}</span>
                                                        <span className="text-emerald-400 font-medium">Outcome: {treat.outcome}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: MEDICATIONS & ALLERGIES */}
                            {activeEhrTab === 'medications' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Active Medications */}
                                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                                            <span>💊</span>
                                            <span>Active Prescriptions &amp; Dosage</span>
                                        </div>
                                        <div className="space-y-3">
                                            {activePatient.medications.map((med, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-100">{med.name}</div>
                                                        <div className="text-[11px] text-gray-400">{med.frequency}</div>
                                                    </div>
                                                    <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-semibold shrink-0">
                                                        {med.dosage}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Allergies & Drug Alerts */}
                                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                                            <span>⚠️</span>
                                            <span>Flagged Patient Allergies</span>
                                        </div>
                                        <div className="space-y-3">
                                            {activePatient.allergies.map((alg, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between gap-3">
                                                    <div className="text-xs font-bold text-gray-200">{alg.name}</div>
                                                    <span
                                                        className={`text-[10px] px-2.5 py-1 rounded-md font-mono uppercase font-bold ${
                                                            alg.severity === 'High'
                                                                ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                                                                : alg.severity === 'Moderate'
                                                                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                                                : 'bg-yellow-500/20 text-yellow-300'
                                                        }`}
                                                    >
                                                        {alg.severity} Severity
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: UPLOADED X-RAYS, MRI SCANS & LAB RESULTS */}
                            {activeEhrTab === 'imaging' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        {/* Search Bar for Diagnostics */}
                                        <div className="relative w-full sm:w-72">
                                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                value={searchEhrQuery}
                                                onChange={(e) => setSearchEhrQuery(e.target.value)}
                                                placeholder="Search X-rays, MRI, Labs..."
                                                className="w-full bg-slate-900/60 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/10 focus:border-teal-500 outline-none placeholder:text-gray-500"
                                            />
                                        </div>

                                        {/* Diagnostic Type Filters */}
                                        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                                            {(['All', 'X-Ray', 'MRI Scan', 'Lab Result'] as const).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setSelectedAttachmentFilter(t)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                                        selectedAttachmentFilter === t
                                                            ? 'bg-teal-600 text-white shadow-md'
                                                            : 'text-gray-400 hover:text-gray-200'
                                                    }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Attachments Cards Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {filteredAttachments.length === 0 ? (
                                            <div className="col-span-full text-center py-8 text-gray-500 text-xs">
                                                No diagnostic files match the filter criteria.
                                            </div>
                                        ) : (
                                            filteredAttachments.map((att) => (
                                                <div
                                                    key={att.id}
                                                    onClick={() => setPreviewModalAttachment(att)}
                                                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/50 transition-all cursor-pointer group space-y-3"
                                                >
                                                    <div className="h-32 rounded-xl overflow-hidden relative border border-white/10">
                                                        <img
                                                            src={att.imageUrl}
                                                            alt={att.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded bg-slate-950/80 text-teal-300 font-mono">
                                                            {att.type}
                                                        </span>
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span>Preview File</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-100 line-clamp-1 group-hover:text-teal-300 transition-colors">
                                                            {att.title}
                                                        </h5>
                                                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                                                            <span>{att.date}</span>
                                                            <span>{att.fileSize}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clinic Modules Showcase */}
                    <div id="modules" className="mt-32 max-w-6xl mx-auto scroll-mt-28">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold">
                                Complete <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Clinic Operating System</span>
                            </h2>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">
                                Modular architecture engineered for high-performance clinical practices.
                            </p>

                            {/* Module Selector */}
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                                {[
                                    { id: 'emr', label: 'EHR Medical Records' },
                                    { id: 'scheduling', label: 'Appointment Scheduling' },
                                    { id: 'doctors', label: 'Doctor Rosters' },
                                    { id: 'billing', label: 'PDF Invoicing & Billing' },
                                    { id: 'reports', label: 'Clinical Analytics' },
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

                        {/* Active Module Box */}
                        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
                            {activeModuleTab === 'emr' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Full Electronic Health Records (EHR)</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Centralized EHR repository featuring complete history timeline, diagnostic ICD coding, allergy risk flags, medication management, and X-ray/MRI image storage.
                                        </p>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-teal-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// MedicalRecord.php Model Schema</div>
                                        <div><span className="text-pink-400">protected</span> $fillable = [</div>
                                        <div className="pl-4 text-green-300">'patient_id', 'medical_history',</div>
                                        <div className="pl-4 text-green-300">'current_medications', 'allergies',</div>
                                        <div className="pl-4 text-green-300">'diagnosis', 'treatment_plan'</div>
                                        <div>];</div>
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
                                        <h3 className="text-2xl font-bold text-white">Smart Appointment Scheduling</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Real-time conflict detection, practitioner availability sync, automated rescheduling, and patient reminder notifications.
                                        </p>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-cyan-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// AppointmentController.php</div>
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
                                        <h3 className="text-2xl font-bold text-white">Practitioner &amp; Specialist Rostering</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Track doctor specializations, active shifts, consultation fees, and instant availability toggles.
                                        </p>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-blue-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// Doctor Model</div>
                                        <div><span className="text-pink-400">public function</span> <span className="text-blue-300">medicalRecords</span>(): HasMany</div>
                                        <div>{'{'}</div>
                                        <div className="pl-4 text-teal-300"><span className="text-pink-400">return</span> $this-&gt;hasMany(MedicalRecord::class);</div>
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
                                        <h3 className="text-2xl font-bold text-white">Itemized PDF Invoicing &amp; Billing</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Instant billing generation, partial payment tracking, itemized procedure invoices, and PDF printing.
                                        </p>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-emerald-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// BillingController.php</div>
                                        <div><span className="text-purple-400">Route::get</span>(<span className="text-green-300">'/invoices/{'{'}invoice{'}'}'</span>,</div>
                                        <div className="pl-4 text-gray-300">[BillingController::class, <span className="text-yellow-300">'showInvoice'</span>]);</div>
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
                                        <h3 className="text-2xl font-bold text-white">Clinical Analytics &amp; CSV/PDF Export</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Real-time reports on patient volume, procedure frequency, revenue summaries, and CSV/PDF data exports.
                                        </p>
                                    </div>
                                    <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-xs text-amber-300 border border-white/10">
                                        <div className="text-gray-500 mb-2">// Export Routes</div>
                                        <div><span className="text-purple-400">Route::get</span>(<span className="text-green-300">'/reports/export/csv'</span>,</div>
                                        <div className="pl-4 text-gray-300">[ReportController::class, <span className="text-yellow-300">'exportCsv'</span>]);</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Final CTA Banner */}
                    <div className="mt-32 max-w-5xl mx-auto">
                        <div className="relative rounded-3xl p-10 sm:p-16 overflow-hidden bg-gradient-to-r from-teal-950/80 via-cyan-950/70 to-slate-950 border border-teal-500/30 text-center shadow-2xl">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                                    <span>🔒 Full HIPAA Compliance &amp; Encrypted EHR Storage</span>
                                </div>
                                <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                                    Ready to empower your practice with EHR?
                                </h2>
                                <p className="text-gray-300 text-base sm:text-lg">
                                    Access complete patient histories, medical imaging, and diagnostic tracking today.
                                </p>
                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href={auth.user ? route('dashboard') : route('register')}
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white font-bold text-lg hover:opacity-95 transition-all shadow-xl shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {auth.user ? 'Access Clinical EHR Dashboard' : 'Register Your Clinic Free'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/10 py-10 relative z-10 bg-[#070b12]/90 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p>© {new Date().getFullYear()} PulseClinic EHR Suite. Built with Laravel v{laravelVersion} (PHP v{phpVersion}).</p>
                        <div className="flex items-center gap-6 text-xs sm:text-sm">
                            <a href="https://laravel.com" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">Laravel Engine</a>
                            <a href="https://inertiajs.com" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">Inertia React</a>
                            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">Tailwind CSS</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
