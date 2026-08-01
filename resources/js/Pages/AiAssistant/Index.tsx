import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface PatientOption {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    medicalRecords?: Array<{
        id: number;
        chief_complaint: string;
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        pain_level?: number;
    }>;
}

interface IcdCode {
    code: string;
    category: string;
    description: string;
    confidence?: number;
    clinical_justification?: string;
}

interface AiAssistantProps {
    patients: PatientOption[];
    selectedPatient?: PatientOption | null;
    icdCodes: IcdCode[];
}

export default function Index({ patients, selectedPatient, icdCodes }: AiAssistantProps) {
    const [activeTab, setActiveTab] = useState<'soap' | 'icd' | 'plan' | 'summary'>('soap');
    const [patientId, setPatientId] = useState<string>(selectedPatient?.id?.toString() || patients[0]?.id?.toString() || '');

    // SOAP Summarizer State
    const [soapSubjective, setSoapSubjective] = useState<string>('Patient reports worsening upper neck stiffness and sharp mid-back tightness after long hours at computer.');
    const [soapObjective, setSoapObjective] = useState<string>('Palpation reveals C4-C5 right lateral fixation, T6 subluxation with severe right paraspinal muscle hypertonicity.');
    const [soapAssessment, setSoapAssessment] = useState<string>('Cervical & Thoracic segmental dysfunction with postural strain.');
    const [soapPlan, setSoapPlan] = useState<string>('HVLA manual adjustment to C4 & T6, cervical traction, myofascial trigger point release.');
    const [soapPainLevel, setSoapPainLevel] = useState<number>(6);
    const [soapResult, setSoapResult] = useState<{ summary: string; takeaways: string[] } | null>(null);
    const [isGeneratingSoap, setIsGeneratingSoap] = useState<boolean>(false);

    // ICD Suggester State
    const [icdInputText, setIcdInputText] = useState<string>('Patient has cervical spine subluxation, severe neck pain, and right leg sciatica shooting pain.');
    const [icdSuggestions, setIcdSuggestions] = useState<IcdCode[]>([]);
    const [isSuggestingIcd, setIsSuggestingIcd] = useState<boolean>(false);

    // Treatment Plan Drafter State
    const [planComplaint, setPlanComplaint] = useState<string>('Lumbar Disc Bulge with Right Sciatica & Low Back Stiffness');
    const [planResult, setPlanResult] = useState<any | null>(null);
    const [isDraftingPlan, setIsDraftingPlan] = useState<boolean>(false);

    // Visit Summary State
    const [visitPatientName, setVisitPatientName] = useState<string>('John Doe');
    const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [visitTreatment, setVisitTreatment] = useState<string>('Full spine manual alignment, lumbar traction therapy, and myofascial release');
    const [visitSummaryResult, setVisitSummaryResult] = useState<string | null>(null);
    const [isGeneratingVisitSummary, setIsGeneratingVisitSummary] = useState<boolean>(false);

    const [copiedText, setCopiedText] = useState<boolean>(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
    };

    // Handle SOAP Summarize
    const handleGenerateSoapSummary = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGeneratingSoap(true);

        fetch(route('ai-assistant.summarize-soap'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any)._token || '' },
            body: JSON.stringify({
                subjective: soapSubjective,
                objective: soapObjective,
                assessment: soapAssessment,
                plan: soapPlan,
                pain_level: soapPainLevel,
            }),
        })
            .then((res) => res.json())
            .then((data) => setSoapResult(data))
            .catch((err) => console.error(err))
            .finally(() => setIsGeneratingSoap(false));
    };

    // Handle ICD Suggestion
    const handleSuggestIcd = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSuggestingIcd(true);

        fetch(route('ai-assistant.suggest-icd'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any)._token || '' },
            body: JSON.stringify({ text: icdInputText }),
        })
            .then((res) => res.json())
            .then((data) => setIcdSuggestions(data.suggested_codes || []))
            .catch((err) => console.error(err))
            .finally(() => setIsSuggestingIcd(false));
    };

    // Handle Plan Draft
    const handleDraftPlan = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDraftingPlan(true);

        fetch(route('ai-assistant.draft-plan'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any)._token || '' },
            body: JSON.stringify({ chief_complaint: planComplaint }),
        })
            .then((res) => res.json())
            .then((data) => setPlanResult(data.plan_draft))
            .catch((err) => console.error(err))
            .finally(() => setIsDraftingPlan(false));
    };

    // Handle Visit Summary
    const handleGenerateVisitSummary = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGeneratingVisitSummary(true);

        fetch(route('ai-assistant.visit-summary'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any)._token || '' },
            body: JSON.stringify({
                patient_name: visitPatientName,
                visit_date: visitDate,
                treatment_provided: visitTreatment,
            }),
        })
            .then((res) => res.json())
            .then((data) => setVisitSummaryResult(data.visit_summary))
            .catch((err) => console.error(err))
            .finally(() => setIsGeneratingVisitSummary(false));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                            <span>✨ AI Clinical</span>
                            <span className="gradient-text">Assistant Workstation</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Intelligent clinical decision-support for SOAP notes, ICD-10 codes, care plans, and patient summaries.
                        </p>
                    </div>

                    {copiedText && (
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold animate-bounce">
                            ✓ Copied to Clipboard!
                        </span>
                    )}
                </div>
            }
        >
            <Head title="AI Clinical Assistant" />

            <div className="space-y-6">
                {/* Mandatory Clinician Disclaimer Callout Banner */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-start gap-3 shadow-lg">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <span className="font-extrabold uppercase tracking-wider block">Clinician Review Notice:</span>
                        AI Clinical Assistant output is intended solely for diagnostic reference and clinical decision-support. All summaries, ICD-10 diagnostic codes, and care plans MUST be reviewed, verified, and approved by the attending licensed chiropractor before adding to official medical charts.
                    </div>
                </div>

                {/* Feature Tabs Navigation Header */}
                <div className="glass-card rounded-3xl p-3 border border-white/10 shadow-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('soap')}
                            className={`p-3.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'soap'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/40'
                                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <span>📝</span>
                            <span>SOAP Summarizer</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('icd')}
                            className={`p-3.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'icd'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/40'
                                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <span>🏷️</span>
                            <span>ICD-10 Suggester</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('plan')}
                            className={`p-3.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'plan'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/40'
                                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <span>📋</span>
                            <span>Treatment Plan Drafter</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('summary')}
                            className={`p-3.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'summary'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/40'
                                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <span>📄</span>
                            <span>Visit Summary</span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: SOAP Summarizer */}
                {activeTab === 'soap' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        {/* Input Box */}
                        <form onSubmit={handleGenerateSoapSummary} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
                            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                    <span>📝 SOAP Notes Entry</span>
                                </h3>
                                <span className="text-xs text-purple-300 font-mono">Chart Context</span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-gray-300 font-bold uppercase mb-1">Subjective (S)</label>
                                    <textarea
                                        rows={3}
                                        value={soapSubjective}
                                        onChange={(e) => setSoapSubjective(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-bold uppercase mb-1">Objective (O)</label>
                                    <textarea
                                        rows={3}
                                        value={soapObjective}
                                        onChange={(e) => setSoapObjective(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-bold uppercase mb-1">Assessment (A)</label>
                                    <textarea
                                        rows={2}
                                        value={soapAssessment}
                                        onChange={(e) => setSoapAssessment(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-bold uppercase mb-1">Plan (P)</label>
                                    <textarea
                                        rows={2}
                                        value={soapPlan}
                                        onChange={(e) => setSoapPlan(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isGeneratingSoap}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
                            >
                                <span>✨</span>
                                <span>{isGeneratingSoap ? 'Synthesizing SOAP Summary...' : 'Generate AI Clinical Summary'}</span>
                            </button>
                        </form>

                        {/* Output Result Box */}
                        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-4 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                        <span>⚡ AI SOAP Summary Output</span>
                                    </h3>
                                    {soapResult && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(soapResult.summary)}
                                            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 text-xs font-bold transition-colors"
                                        >
                                            Copy Summary 📋
                                        </button>
                                    )}
                                </div>

                                {!soapResult ? (
                                    <div className="p-8 text-center text-gray-400 space-y-2 my-auto">
                                        <span className="text-3xl block">✨</span>
                                        <p className="text-xs">Click "Generate AI Clinical Summary" to synthesize charting notes into structured takeaways.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-xs font-mono">
                                        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 leading-relaxed text-gray-200 whitespace-pre-wrap">
                                            {soapResult.summary}
                                        </div>

                                        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                                            <span className="text-purple-300 font-bold uppercase block text-[10px]">Key Clinical Takeaways:</span>
                                            {soapResult.takeaways.map((t, idx) => (
                                                <div key={idx} className="text-white font-semibold flex items-center gap-2">
                                                    <span>•</span>
                                                    <span>{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: ICD-10 Suggester */}
                {activeTab === 'icd' && (
                    <div className="space-y-6 animate-fade-in">
                        <form onSubmit={handleSuggestIcd} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
                            <div className="border-b border-white/10 pb-3">
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    <span>🏷️ Diagnostic ICD-10 Code Suggester</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Describe patient symptoms, subluxation findings, or anatomical pain locations to get matched ICD-10 codes.
                                </p>
                            </div>

                            <div>
                                <textarea
                                    rows={3}
                                    value={icdInputText}
                                    onChange={(e) => setIcdInputText(e.target.value)}
                                    placeholder="e.g., Patient presents with cervical spine subluxation, lower back stiffness, and right sciatica pain..."
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3.5 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSuggestingIcd}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                            >
                                <span>🔍</span>
                                <span>{isSuggestingIcd ? 'Analyzing Clinical Keywords...' : 'Suggest Matching ICD-10 Codes'}</span>
                            </button>
                        </form>

                        {/* Code Suggestion Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {icdSuggestions.map((icd) => (
                                <div
                                    key={icd.code}
                                    className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-black font-mono text-purple-300 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                            {icd.code}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                            {icd.confidence || 90}% Match Confidence
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-extrabold text-white">{icd.description}</h4>
                                        <span className="text-xs text-gray-400 font-mono block mt-0.5">Category: {icd.category}</span>
                                    </div>

                                    {icd.clinical_justification && (
                                        <p className="text-xs text-gray-300 italic bg-black/40 p-3 rounded-xl border border-white/5">
                                            "{icd.clinical_justification}"
                                        </p>
                                    )}

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`${icd.code} - ${icd.description}`)}
                                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 text-xs font-bold transition-colors"
                                        >
                                            Copy Code 📋
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: Treatment Plan Drafter */}
                {activeTab === 'plan' && (
                    <div className="space-y-6 animate-fade-in">
                        <form onSubmit={handleDraftPlan} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
                            <div className="border-b border-white/10 pb-3">
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    <span>📋 Multi-Phase Chiropractic Care Plan Drafter</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Specify chief complaint to auto-draft a 3-phase care program with visit frequency and home exercises.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Chief Complaint / Condition</label>
                                <input
                                    type="text"
                                    value={planComplaint}
                                    onChange={(e) => setPlanComplaint(e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs font-semibold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isDraftingPlan}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                            >
                                <span>✨</span>
                                <span>{isDraftingPlan ? 'Drafting Care Plan...' : 'Draft AI Treatment Plan'}</span>
                            </button>
                        </form>

                        {planResult && (
                            <div className="glass-card rounded-3xl p-8 border border-purple-500/30 shadow-2xl space-y-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-white">{planResult.title}</h3>
                                        <span className="text-xs text-purple-300 font-mono">{planResult.frequency}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(JSON.stringify(planResult, null, 2))}
                                        className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 font-bold text-xs hover:bg-purple-600/30 transition-colors"
                                    >
                                        Copy Draft JSON 📋
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {planResult.phases.map((phase: any) => (
                                        <div key={phase.phase_number} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                                            <h4 className="text-xs font-extrabold text-purple-300 uppercase">{phase.name}</h4>
                                            <p className="text-xs text-gray-300 font-mono">{phase.goals}</p>
                                            <div className="pt-2 border-t border-white/10">
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Interventions:</span>
                                                {phase.interventions.map((inv: string, idx: number) => (
                                                    <span key={idx} className="text-[11px] text-white block">• {inv}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
                                    <span className="text-purple-300 font-bold uppercase block">Home Exercise Prescriptions:</span>
                                    {planResult.home_care_instructions.map((inst: string, idx: number) => (
                                        <div key={idx} className="text-gray-300">✓ {inst}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: Visit Summary Generator */}
                {activeTab === 'summary' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        <form onSubmit={handleGenerateVisitSummary} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
                            <div className="border-b border-white/10 pb-3">
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    <span>📄 Generate Patient Visit Summary</span>
                                </h3>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-gray-300 font-bold uppercase mb-1">Patient Name</label>
                                    <input
                                        type="text"
                                        value={visitPatientName}
                                        onChange={(e) => setVisitPatientName(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 font-bold uppercase mb-1">Date of Visit</label>
                                    <input
                                        type="date"
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 font-bold uppercase mb-1">Care & Treatment Provided</label>
                                    <textarea
                                        rows={3}
                                        value={visitTreatment}
                                        onChange={(e) => setVisitTreatment(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isGeneratingVisitSummary}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
                            >
                                <span>📄</span>
                                <span>{isGeneratingVisitSummary ? 'Synthesizing Visit Report...' : 'Generate Patient Visit Summary'}</span>
                            </button>
                        </form>

                        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-4 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <h3 className="text-base font-extrabold text-white">Generated Visit Report</h3>
                                    {visitSummaryResult && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(visitSummaryResult)}
                                            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 text-xs font-bold transition-colors"
                                        >
                                            Copy Summary 📋
                                        </button>
                                    )}
                                </div>

                                {!visitSummaryResult ? (
                                    <p className="text-xs text-gray-400 text-center py-12">
                                        Click "Generate Patient Visit Summary" to build a professional patient report.
                                    </p>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 leading-relaxed text-xs text-gray-200 font-mono whitespace-pre-wrap">
                                        {visitSummaryResult}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
