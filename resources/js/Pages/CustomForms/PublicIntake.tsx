import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CustomFormField, CustomFormModel } from './Index';

interface PatientOption {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface PublicIntakeProps {
    form: CustomFormModel;
    patients: PatientOption[];
}

export default function PublicIntake({ form, patients }: PublicIntakeProps) {
    const flashMessage = (usePage().props as any).flash?.message;

    const [submitted, setSubmitted] = useState(false);

    const intakeForm = useForm({
        patient_id: '' as string | number,
        submitted_by_name: '',
        submitted_by_email: '',
        response_data: {} as Record<string, any>,
    });

    const handlePatientChange = (patientId: string) => {
        const selected = patients.find((p) => p.id === Number(patientId));
        if (selected) {
            intakeForm.setData({
                ...intakeForm.data,
                patient_id: selected.id,
                submitted_by_name: `${selected.first_name} ${selected.last_name}`,
                submitted_by_email: selected.email,
            });
        } else {
            intakeForm.setData('patient_id', '');
        }
    };

    const handleResponseChange = (fieldId: string, value: any) => {
        intakeForm.setData('response_data', {
            ...intakeForm.data.response_data,
            [fieldId]: value,
        });
    };

    const handleCheckboxToggle = (fieldId: string, option: string, checked: boolean) => {
        const currentArr: string[] = intakeForm.data.response_data[fieldId] || [];
        const updated = checked
            ? [...currentArr, option]
            : currentArr.filter((item) => item !== option);

        intakeForm.setData('response_data', {
            ...intakeForm.data.response_data,
            [fieldId]: updated,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        intakeForm.post(route('intake-forms.submit', form.id), {
            onSuccess: () => setSubmitted(true),
        });
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans p-4 sm:p-8 flex items-center justify-center selection:bg-purple-500 selection:text-white">
            <Head title={`Intake Form - ${form.title}`} />

            <div className="max-w-2xl w-full space-y-6">
                {/* Header Branding */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono font-bold">
                        <span>📋 Chirper Spine Clinic Digital Intake</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{form.title}</h1>
                    {form.description && <p className="text-sm text-gray-400 max-w-lg mx-auto">{form.description}</p>}
                </div>

                {submitted || flashMessage ? (
                    <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 bg-emerald-950/20 text-center space-y-4 shadow-2xl">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 font-bold text-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
                            ✓
                        </div>
                        <h2 className="text-2xl font-extrabold text-white">Intake Submitted Successfully!</h2>
                        <p className="text-sm text-gray-300">
                            Thank you for completing your digital health form. Your responses have been sent directly to your attending chiropractor's medical records dossier.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                        {/* Patient Identification Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                            <h3 className="text-xs font-extrabold uppercase font-mono text-purple-300">
                                👤 Patient Identification
                            </h3>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Select Existing Patient (Optional)
                                </label>
                                <select
                                    value={intakeForm.data.patient_id}
                                    onChange={(e) => handlePatientChange(e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                >
                                    <option value="">-- New Patient / Fill Manually --</option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Your Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. John Doe"
                                        value={intakeForm.data.submitted_by_name}
                                        onChange={(e) => intakeForm.setData('submitted_by_name', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. john@example.com"
                                        value={intakeForm.data.submitted_by_email}
                                        onChange={(e) => intakeForm.setData('submitted_by_email', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Questions Render */}
                        <div className="space-y-6 pt-2">
                            {(form.fields || []).map((field: CustomFormField, idx: number) => (
                                <div key={field.id} className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <label className="block text-sm font-extrabold text-white">
                                        <span className="text-purple-400 font-mono mr-1">#{idx + 1}.</span>
                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                    </label>

                                    {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}

                                    {/* Render Controls */}
                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            value={intakeForm.data.response_data[field.id] || ''}
                                            onChange={(e) => handleResponseChange(field.id, e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <textarea
                                            rows={3}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            value={intakeForm.data.response_data[field.id] || ''}
                                            onChange={(e) => handleResponseChange(field.id, e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                min={1}
                                                max={10}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                                value={intakeForm.data.response_data[field.id] || ''}
                                                onChange={(e) => handleResponseChange(field.id, e.target.value)}
                                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs font-mono font-bold"
                                            />
                                        </div>
                                    )}

                                    {field.type === 'select' && (
                                        <select
                                            required={field.required}
                                            value={intakeForm.data.response_data[field.id] || ''}
                                            onChange={(e) => handleResponseChange(field.id, e.target.value)}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                        >
                                            <option value="">-- Select an option --</option>
                                            {(field.options || []).map((opt, i) => (
                                                <option key={i} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {field.type === 'radio' && (
                                        <div className="space-y-2 pt-1">
                                            {(field.options || []).map((opt, i) => (
                                                <label key={i} className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`radio_${field.id}`}
                                                        required={field.required}
                                                        checked={intakeForm.data.response_data[field.id] === opt}
                                                        onChange={() => handleResponseChange(field.id, opt)}
                                                        className="rounded-full border-white/20 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {field.type === 'checkbox' && (
                                        <div className="space-y-2 pt-1">
                                            {(field.options || []).map((opt, i) => {
                                                const selectedArr: string[] = intakeForm.data.response_data[field.id] || [];
                                                const isChecked = selectedArr.includes(opt);

                                                return (
                                                    <label key={i} className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => handleCheckboxToggle(field.id, opt, e.target.checked)}
                                                            className="rounded border-white/20 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <span>{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={intakeForm.processing}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Submit Digital Intake Form →</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
