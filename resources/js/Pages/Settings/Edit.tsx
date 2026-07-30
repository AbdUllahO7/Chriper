import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export interface ServiceItem {
    id?: number;
    name: string;
    category?: string;
    price: number;
    duration_minutes: number;
}

export interface ClinicSettingData {
    id: number;
    clinic_name: string;
    logo_url: string | null;
    phone: string;
    email: string;
    address: string;
    working_hours: string;
    currency_code: string;
    currency_symbol: string;
    tax_rate: number;
    services: ServiceItem[] | null;
}

interface CurrencyOption {
    code: string;
    symbol: string;
    name: string;
}

interface EditProps {
    settings: ClinicSettingData;
    currencies: CurrencyOption[];
}

export default function Edit({ settings, currencies }: EditProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url);

    const form = useForm({
        clinic_name: settings.clinic_name || 'Chirper Spine Clinic',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        working_hours: settings.working_hours || 'Mon - Fri: 08:00 AM - 06:00 PM',
        currency_code: settings.currency_code || 'USD',
        currency_symbol: settings.currency_symbol || '$',
        tax_rate: settings.tax_rate || 0,
        logo: null as File | null,
        services: settings.services || [
            { name: 'Spinal Decompression Therapy', category: 'Decompression', price: 150, duration_minutes: 30 },
            { name: 'Initial Chiropractic Exam', category: 'Consultation', price: 120, duration_minutes: 45 },
        ],
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCurrencySelect = (code: string) => {
        const found = currencies.find((c) => c.code === code);
        form.setData((prev) => ({
            ...prev,
            currency_code: code,
            currency_symbol: found ? found.symbol : '$',
        }));
    };

    const handleAddServiceRow = () => {
        form.setData('services', [
            ...form.data.services,
            { name: '', category: 'General', price: 100, duration_minutes: 30 },
        ]);
    };

    const handleRemoveServiceRow = (index: number) => {
        const list = [...form.data.services];
        list.splice(index, 1);
        form.setData('services', list);
    };

    const handleServiceChange = (index: number, field: string, value: any) => {
        const list = [...form.data.services];
        list[index] = { ...list[index], [field]: value };
        form.setData('services', list);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Clinic <span className="gradient-text">Settings</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Clinic branding logo, working hours, clinical services catalog, taxes, and currency defaults.
                    </p>
                </div>
            }
        >
            <Head title="Clinic Settings" />

            <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
                {/* 1. Clinic Profile & Logo Customization */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                        <span>🏬 Clinic Profile & Logo Customization</span>
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
                        <div className="relative shrink-0">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Clinic Logo"
                                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-purple-500/40 shadow-xl"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-purple-500/40 shadow-xl">
                                    🏥
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                            <label className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/40 text-xs font-bold transition-all cursor-pointer inline-block">
                                📷 Upload Clinic Logo
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                            </label>
                            <p className="text-[11px] text-gray-400">Recommended size: PNG or JPG under 2MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Clinic Name *</label>
                            <input
                                type="text"
                                required
                                value={form.data.clinic_name}
                                onChange={(e) => form.setData('clinic_name', e.target.value)}
                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number *</label>
                            <input
                                type="text"
                                required
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
                            <input
                                type="email"
                                required
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Physical Address *</label>
                            <input
                                type="text"
                                required
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Working Hours & Operating Schedule */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                        <span>🕒 Operating Working Hours</span>
                    </h3>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Clinic Working Hours *</label>
                        <input
                            type="text"
                            required
                            value={form.data.working_hours}
                            onChange={(e) => form.setData('working_hours', e.target.value)}
                            placeholder="e.g. Mon - Fri: 08:00 AM - 06:00 PM, Sat: 09:00 AM - 02:00 PM"
                            className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-semibold"
                        />
                        <span className="text-[11px] text-gray-400 mt-1 block">
                            Displayed on patient appointment bookings and printable receipts.
                        </span>
                    </div>
                </div>

                {/* 3. Taxes & Currency Settings */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                        <span>💰 Taxes & Currency System</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Clinic Currency *</label>
                            <select
                                value={form.data.currency_code}
                                onChange={(e) => handleCurrencySelect(e.target.value)}
                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-bold"
                            >
                                {currencies.map((c) => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Billing Sales Tax Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={form.data.tax_rate}
                                onChange={(e) => form.setData('tax_rate', Number(e.target.value))}
                                className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/10 focus:border-purple-500 outline-none text-sm font-mono font-bold"
                            />
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                Default tax rate applied during invoice generation (0% for tax-free care).
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Clinical Services Catalog Manager */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>🩺 Clinical Services & Pricing Catalog</span>
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddServiceRow}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 text-xs font-bold transition-all"
                        >
                            + Add Service Row
                        </button>
                    </div>

                    <div className="space-y-3">
                        {form.data.services.map((srv, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                <input
                                    type="text"
                                    required
                                    placeholder="Service Name (e.g. Lumbar Decompression)"
                                    value={srv.name}
                                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                                    className="col-span-5 bg-[#0b0f19] text-white text-xs font-bold rounded-xl p-2.5 border border-white/10 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={srv.category || ''}
                                    onChange={(e) => handleServiceChange(idx, 'category', e.target.value)}
                                    className="col-span-3 bg-[#0b0f19] text-white text-xs rounded-xl p-2.5 border border-white/10 outline-none"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="Price ($)"
                                    value={srv.price}
                                    onChange={(e) => handleServiceChange(idx, 'price', Number(e.target.value))}
                                    className="col-span-2 bg-[#0b0f19] text-white text-xs font-mono font-bold rounded-xl p-2.5 border border-white/10 outline-none text-center"
                                />
                                <input
                                    type="number"
                                    min="5"
                                    required
                                    placeholder="Mins"
                                    value={srv.duration_minutes}
                                    onChange={(e) => handleServiceChange(idx, 'duration_minutes', Number(e.target.value))}
                                    className="col-span-1 bg-[#0b0f19] text-white text-xs font-mono rounded-xl p-2.5 border border-white/10 outline-none text-center"
                                />
                                {form.data.services.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveServiceRow(idx)}
                                        className="col-span-1 text-red-400 hover:text-red-300 text-xs font-bold text-center"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Submit Button */}
                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-xl shadow-purple-600/30 active:scale-95"
                    >
                        Save Clinic Settings
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
