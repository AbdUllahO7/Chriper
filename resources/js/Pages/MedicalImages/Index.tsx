import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export interface MedicalImageItem {
    id: number;
    patient_id: number;
    doctor_id?: number | null;
    image_type: 'xray' | 'mri' | 'ct_scan';
    body_region: string;
    title: string;
    scan_date: string;
    file_path: string;
    file_size: number;
    file_url: string;
    notes?: string | null;
    patient?: { id: number; first_name: string; last_name: string; email: string };
    doctor?: { id: number; name: string; specialty: string };
}

interface IndexProps {
    medicalImages: {
        data: MedicalImageItem[];
        links: any[];
    };
    patients: Array<{ id: number; first_name: string; last_name: string; email: string }>;
    doctors: Array<{ id: number; name: string; specialty: string }>;
    filters: { search: string; image_type: string; body_region: string; patient_id: string };
    bodyRegions: string[];
}

export default function Index({ medicalImages, patients, doctors, filters, bodyRegions }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.image_type || '');
    const [regionFilter, setRegionFilter] = useState(filters.body_region || '');

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [deletingImage, setDeletingImage] = useState<MedicalImageItem | null>(null);

    // Compare multi-select state
    const [selectedCompareIds, setSelectedCompareIds] = useState<number[]>([]);

    const uploadForm = useForm({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        image_type: 'xray' as 'xray' | 'mri' | 'ct_scan',
        body_region: bodyRegions[0] || 'Cervical Spine',
        title: '',
        scan_date: new Date().toISOString().split('T')[0],
        file: null as File | null,
        notes: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('medical-images.index'),
            { search, image_type: typeFilter, body_region: regionFilter },
            { preserveState: true }
        );
    };

    const handleTypeFilterChange = (type: string) => {
        setTypeFilter(type);
        router.get(
            route('medical-images.index'),
            { search, image_type: type, body_region: regionFilter },
            { preserveState: true }
        );
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(route('medical-images.store'), {
            onSuccess: () => {
                uploadForm.reset();
                setIsUploadModalOpen(false);
            },
        });
    };

    const toggleCompareSelect = (id: number) => {
        if (selectedCompareIds.includes(id)) {
            setSelectedCompareIds(selectedCompareIds.filter((item) => item !== id));
        } else {
            if (selectedCompareIds.length >= 2) {
                // Keep the latest two
                setSelectedCompareIds([selectedCompareIds[1], id]);
            } else {
                setSelectedCompareIds([...selectedCompareIds, id]);
            }
        }
    };

    const handleLaunchCompare = () => {
        if (selectedCompareIds.length < 2) {
            alert('Please select 2 radiology scans to compare before/after.');
            return;
        }
        router.get(route('medical-images.compare'), {
            image_a: selectedCompareIds[0],
            image_b: selectedCompareIds[1],
        });
    };

    const confirmDeleteImage = () => {
        if (deletingImage) {
            router.delete(route('medical-images.destroy', deletingImage.id));
        }
    };

    const getTypeBadge = (type: MedicalImageItem['image_type']) => {
        if (type === 'xray') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        if (type === 'mri') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Radiology & <span className="gradient-text">Medical Imaging</span>
                        </h1>
                        <p className="text-sm text-gray-400">
                            Inspect X-Rays, MRIs, and CT Scans with interactive zoom, rotation, DICOM filters, and before/after comparison.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedCompareIds.length > 0 && (
                            <button
                                onClick={handleLaunchCompare}
                                className="px-4 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-extrabold text-xs border border-purple-500/40 shadow-lg transition-all flex items-center gap-2"
                            >
                                <span>🔍</span>
                                <span>Compare Selected ({selectedCompareIds.length}/2)</span>
                            </button>
                        )}

                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                        >
                            <span>📤</span>
                            <span>Upload Medical Scan</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Radiology & Medical Imaging Viewer" />

            <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, body region, or patient name..."
                            className="w-full bg-[#0b0f19] text-white rounded-xl px-4 py-2.5 border border-white/15 focus:border-purple-500 outline-none text-xs"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold text-xs hover:bg-purple-600/30 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        {['', 'xray', 'mri', 'ct_scan'].map((type) => (
                            <button
                                key={type}
                                onClick={() => handleTypeFilterChange(type)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all uppercase ${
                                    typeFilter === type
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                }`}
                            >
                                {type === '' ? 'All Scans' : type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Radiology Imaging Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {medicalImages.data.length === 0 ? (
                        <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-white/10 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mx-auto border border-purple-500/20">
                                🩻
                            </div>
                            <h3 className="text-lg font-bold text-white">No Radiology Scans Uploaded</h3>
                            <p className="text-xs text-gray-400 max-w-md mx-auto">
                                Upload patient X-Rays, MRIs, and CT Scans to analyze spinal alignment and track before/after recovery.
                            </p>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all inline-block mt-2"
                            >
                                Upload First Medical Scan
                            </button>
                        </div>
                    ) : (
                        medicalImages.data.map((img) => {
                            const isSelectedForCompare = selectedCompareIds.includes(img.id);

                            return (
                                <div
                                    key={img.id}
                                    className={`glass-card rounded-3xl overflow-hidden border shadow-xl transition-all duration-300 flex flex-col justify-between group ${
                                        isSelectedForCompare
                                            ? 'border-purple-500 ring-2 ring-purple-500/40'
                                            : 'border-white/10 hover:border-purple-500/40'
                                    }`}
                                >
                                    {/* Image Thumbnail Container */}
                                    <div className="relative h-52 bg-slate-950 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={img.file_url}
                                            alt={img.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Image Type Badge */}
                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border uppercase ${getTypeBadge(img.image_type)}`}>
                                                {img.image_type.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {/* Compare Selection Checkbox Pill */}
                                        <button
                                            type="button"
                                            onClick={() => toggleCompareSelect(img.id)}
                                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
                                                isSelectedForCompare
                                                    ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                                                    : 'bg-black/60 text-gray-300 border-white/20 hover:bg-black/80'
                                            }`}
                                        >
                                            {isSelectedForCompare ? '✓ Compare' : '+ Compare'}
                                        </button>

                                        {/* Scan Date Overlay */}
                                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-gray-300 border border-white/10">
                                            📅 {new Date(img.scan_date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                                                {img.title}
                                            </h3>
                                            <p className="text-xs text-purple-300 font-semibold">
                                                Patient: {img.patient?.first_name} {img.patient?.last_name}
                                            </p>
                                            <span className="text-[11px] text-gray-400 font-mono block">
                                                Region: {img.body_region}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                            <button
                                                onClick={() => setDeletingImage(img)}
                                                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 text-xs font-bold transition-colors"
                                            >
                                                Delete
                                            </button>

                                            <Link
                                                href={route('medical-images.show', img.id)}
                                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 transition-all"
                                            >
                                                Open Workstation 🔍
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deletingImage}
                title="Delete Medical Scan"
                message="Are you sure you want to remove this medical scan from patient record?"
                confirmText="Delete Scan"
                onConfirm={confirmDeleteImage}
                onClose={() => setDeletingImage(null)}
            />

            {/* Upload Medical Scan Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                                <span>📤 Upload Medical Scan</span>
                            </h3>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-purple-300 mb-1">
                                    Select Patient *
                                </label>
                                <select
                                    value={uploadForm.data.patient_id}
                                    onChange={(e) => uploadForm.setData('patient_id', Number(e.target.value))}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Scan Type *
                                    </label>
                                    <select
                                        value={uploadForm.data.image_type}
                                        onChange={(e) => uploadForm.setData('image_type', e.target.value as any)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs uppercase"
                                    >
                                        <option value="xray">X-Ray Scan</option>
                                        <option value="mri">MRI Scan</option>
                                        <option value="ct_scan">CT Scan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Body Region *
                                    </label>
                                    <select
                                        value={uploadForm.data.body_region}
                                        onChange={(e) => uploadForm.setData('body_region', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                    >
                                        {bodyRegions.map((r) => (
                                            <option key={r} value={r}>
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Scan Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Pre-Treatment Cervical Spine Lateral View"
                                    value={uploadForm.data.title}
                                    onChange={(e) => uploadForm.setData('title', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Scan Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={uploadForm.data.scan_date}
                                        onChange={(e) => uploadForm.setData('scan_date', e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                        Image File *
                                    </label>
                                    <input
                                        type="file"
                                        required
                                        accept="image/*"
                                        onChange={(e) => uploadForm.setData('file', e.target.files?.[0] || null)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-2 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Clinical Radiologist Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Spinal subluxation at C4-C5, reduced cervical lordosis..."
                                    value={uploadForm.data.notes}
                                    onChange={(e) => uploadForm.setData('notes', e.target.value)}
                                    className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
                                >
                                    Upload Scan to Dossier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
