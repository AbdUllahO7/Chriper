import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CustomFormField, CustomFormModel } from './Index';

interface BuilderProps {
    form: CustomFormModel;
}

export default function Builder({ form }: BuilderProps) {
    const [fields, setFields] = useState<CustomFormField[]>(form.fields || []);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
        form.fields && form.fields.length > 0 ? form.fields[0].id : null
    );

    const builderForm = useForm({
        title: form.title,
        description: form.description || '',
        status: form.status,
        is_active: form.is_active,
        fields: (form.fields || []) as any,
    });

    const selectedField = fields.find((f) => f.id === selectedFieldId);

    // Field Palette Items
    const addFieldType = (type: CustomFormField['type']) => {
        const newId = `field_${Date.now()}`;
        let defaultLabel = 'New Question';
        let defaultOptions: string[] | undefined = undefined;

        switch (type) {
            case 'text':
                defaultLabel = 'Patient Full Name / Short Answer';
                break;
            case 'textarea':
                defaultLabel = 'Detailed Symptom Description';
                break;
            case 'number':
                defaultLabel = 'Pain Severity Level (1 - 10)';
                break;
            case 'select':
                defaultLabel = 'Primary Pain Frequency';
                defaultOptions = ['Constant (76-100%)', 'Frequent (51-75%)', 'Occasional (26-50%)', 'Intermittent (0-25%)'];
                break;
            case 'radio':
                defaultLabel = 'Have you had prior chiropractic care?';
                defaultOptions = ['Yes', 'No'];
                break;
            case 'checkbox':
                defaultLabel = 'Select all accompanying symptoms:';
                defaultOptions = ['Numbness', 'Tingling', 'Muscle Spasms', 'Headaches'];
                break;
        }

        const newField: CustomFormField = {
            id: newId,
            label: defaultLabel,
            type,
            required: true,
            options: defaultOptions,
            placeholder: type === 'number' ? 'Enter a number 1 - 10' : 'Type your answer here...',
        };

        const updated = [...fields, newField];
        setFields(updated);
        setSelectedFieldId(newId);
        builderForm.setData('fields', updated);
    };

    const updateSelectedField = (key: keyof CustomFormField, value: any) => {
        if (!selectedFieldId) return;
        const updated = fields.map((f) => (f.id === selectedFieldId ? { ...f, [key]: value } : f));
        setFields(updated);
        builderForm.setData('fields', updated);
    };

    const removeField = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = fields.filter((f) => f.id !== id);
        setFields(updated);
        if (selectedFieldId === id) {
            setSelectedFieldId(updated.length > 0 ? updated[0].id : null);
        }
        builderForm.setData('fields', updated);
    };

    const moveField = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) return;
        const updated = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        setFields(updated);
        builderForm.setData('fields', updated);
    };

    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        builderForm.setData('fields', fields);
        builderForm.put(route('custom-forms.update', form.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('custom-forms.index')}
                            className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white border border-white/10 text-xs font-bold"
                        >
                            ← Back to Forms
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                                <span>🛠️ Visual Form Builder:</span>
                                <span className="gradient-text">{builderForm.data.title}</span>
                            </h1>
                            <p className="text-xs text-gray-400">Configure questions, input controls, and options without writing code.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('intake-forms.show', form.id)}
                            target="_blank"
                            className="px-4 py-2.5 rounded-2xl bg-white/5 text-purple-300 hover:text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <span>👁️ Preview Form</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handleSaveSubmit}
                            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                        >
                            <span>💾 Save Changes</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Form Builder - ${form.title}`} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar: Component Palette */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-sm font-extrabold uppercase font-mono text-purple-300">Add Question Type</h3>
                            <p className="text-[11px] text-gray-400">Click to insert question controls into form canvas.</p>
                        </div>

                        <div className="space-y-2">
                            {[
                                { type: 'text', label: '🔤 Short Text Answer', desc: 'Single line text input' },
                                { type: 'textarea', label: '📝 Paragraph Textarea', desc: 'Multi-line detailed answer' },
                                { type: 'number', label: '🔢 Pain Rating / Number', desc: 'Pain scale 1-10 or numeric' },
                                { type: 'select', label: '🔽 Dropdown Selection', desc: 'Single pick dropdown menu' },
                                { type: 'radio', label: '🔘 Radio Button Choices', desc: 'Multiple choice radio option' },
                                { type: 'checkbox', label: '☑️ Checkbox List', desc: 'Select all that apply' },
                            ].map((item) => (
                                <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => addFieldType(item.type as any)}
                                    className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-purple-600/20 text-left border border-white/10 hover:border-purple-500/40 transition-all group"
                                >
                                    <span className="block font-bold text-white text-xs group-hover:text-purple-300">
                                        {item.label}
                                    </span>
                                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{item.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center Canvas: Live Form Preview & Ordering */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
                        {/* Form Title & Description Settings */}
                        <div className="space-y-3 pb-6 border-b border-white/10">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">Form Title</label>
                                <input
                                    type="text"
                                    value={builderForm.data.title}
                                    onChange={(e) => builderForm.setData('title', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-sm font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Form Description</label>
                                <textarea
                                    rows={2}
                                    value={builderForm.data.description}
                                    onChange={(e) => builderForm.setData('description', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-1">
                                <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                                    <span>Publish Status:</span>
                                    <select
                                        value={builderForm.data.status}
                                        onChange={(e) => builderForm.setData('status', e.target.value as any)}
                                        className="bg-[#0b0f19] text-white rounded-xl px-3 py-1.5 border border-white/15 text-xs capitalize"
                                    >
                                        <option value="published">Published (Live)</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {/* Interactive Canvas Fields List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-extrabold uppercase font-mono text-gray-400">
                                    Questions ({fields.length})
                                </h3>
                            </div>

                            {fields.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl space-y-2">
                                    <p className="text-xs font-mono text-gray-500">No questions added yet.</p>
                                    <p className="text-[11px] text-purple-400">Click any component in the left sidebar to insert a question.</p>
                                </div>
                            ) : (
                                fields.map((field, idx) => {
                                    const isSelected = field.id === selectedFieldId;

                                    return (
                                        <div
                                            key={field.id}
                                            onClick={() => setSelectedFieldId(field.id)}
                                            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                                                isSelected
                                                    ? 'bg-purple-950/20 border-purple-500 shadow-lg shadow-purple-600/20 ring-1 ring-purple-500'
                                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 text-xs font-mono font-bold flex items-center justify-center">
                                                        #{idx + 1}
                                                    </span>
                                                    <h4 className="font-extrabold text-white text-sm">
                                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                                    </h4>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => moveField(idx, 'up', e)}
                                                        disabled={idx === 0}
                                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => moveField(idx, 'down', e)}
                                                        disabled={idx === fields.length - 1}
                                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30"
                                                    >
                                                        ▼
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => removeField(field.id, e)}
                                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Preview Render of Control */}
                                            <div className="pt-1">
                                                {field.type === 'text' && (
                                                    <input
                                                        type="text"
                                                        disabled
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-[#0b0f19]/50 text-gray-400 rounded-xl p-2.5 border border-white/10 text-xs"
                                                    />
                                                )}

                                                {field.type === 'textarea' && (
                                                    <textarea
                                                        rows={2}
                                                        disabled
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-[#0b0f19]/50 text-gray-400 rounded-xl p-2.5 border border-white/10 text-xs"
                                                    />
                                                )}

                                                {field.type === 'number' && (
                                                    <input
                                                        type="number"
                                                        disabled
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-[#0b0f19]/50 text-gray-400 rounded-xl p-2.5 border border-white/10 text-xs"
                                                    />
                                                )}

                                                {field.type === 'select' && (
                                                    <select disabled className="w-full bg-[#0b0f19]/50 text-gray-400 rounded-xl p-2.5 border border-white/10 text-xs">
                                                        {(field.options || []).map((opt, i) => (
                                                            <option key={i}>{opt}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {(field.type === 'radio' || field.type === 'checkbox') && (
                                                    <div className="space-y-1.5">
                                                        {(field.options || []).map((opt, i) => (
                                                            <label key={i} className="flex items-center gap-2 text-xs text-gray-300">
                                                                <input type={field.type} disabled className="rounded border-white/20 text-purple-600" />
                                                                <span>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Inspector Sidebar: Question Inspector & Properties */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-sm font-extrabold uppercase font-mono text-purple-300">Question Inspector</h3>
                            <p className="text-[11px] text-gray-400">Configure selected question details and choices.</p>
                        </div>

                        {!selectedField ? (
                            <p className="text-xs text-gray-500 text-center py-6">Select a question in the canvas to edit its properties.</p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Question Label *</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateSelectedField('label', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Input Control Type</label>
                                    <select
                                        value={selectedField.type}
                                        onChange={(e) => updateSelectedField('type', e.target.value as any)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs capitalize"
                                    >
                                        <option value="text">Short Text Answer</option>
                                        <option value="textarea">Paragraph Textarea</option>
                                        <option value="number">Pain Rating / Number</option>
                                        <option value="select">Dropdown Choice</option>
                                        <option value="radio">Radio Buttons</option>
                                        <option value="checkbox">Checkbox List</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Placeholder Text</label>
                                    <input
                                        type="text"
                                        value={selectedField.placeholder || ''}
                                        onChange={(e) => updateSelectedField('placeholder', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Help Guidance Text</label>
                                    <input
                                        type="text"
                                        value={selectedField.help_text || ''}
                                        onChange={(e) => updateSelectedField('help_text', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs"
                                    />
                                </div>

                                {/* Options List for Select/Radio/Checkbox */}
                                {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                                    <div className="space-y-2 pt-2 border-t border-white/10">
                                        <label className="block text-xs font-bold uppercase text-purple-300">
                                            Choices / Options (One per line)
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={(selectedField.options || []).join('\n')}
                                            onChange={(e) => updateSelectedField('options', e.target.value.split('\n'))}
                                            className="w-full bg-[#0b0f19] text-white rounded-xl p-2.5 border border-white/15 text-xs font-mono"
                                        />
                                    </div>
                                )}

                                <div className="pt-2 border-t border-white/10">
                                    <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedField.required}
                                            onChange={(e) => updateSelectedField('required', e.target.checked)}
                                            className="rounded border-white/20 text-purple-600"
                                        />
                                        <span>Required Question</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
