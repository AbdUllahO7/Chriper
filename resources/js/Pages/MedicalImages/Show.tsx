import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import XRayViewer from '@/Components/XRayViewer';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { MedicalImageItem } from './Index';

interface ShowProps {
    medicalImage: MedicalImageItem;
    otherScans: MedicalImageItem[];
}

export default function Show({ medicalImage, otherScans }: ShowProps) {
    const [selectedCompareId, setSelectedCompareId] = useState<string>(
        otherScans[0]?.id?.toString() || ''
    );

    const handleLaunchCompare = () => {
        if (!selectedCompareId) return;
        router.get(route('medical-images.compare'), {
            image_a: medicalImage.id,
            image_b: selectedCompareId,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('medical-images.index')}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Imaging Gallery
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Diagnostic Radiology <span className="gradient-text">Workstation</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                {medicalImage.title} • {medicalImage.patient?.first_name} {medicalImage.patient?.last_name}.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Radiology Workstation - ${medicalImage.title}`} />

            <div className="space-y-6">
                {/* Main Workstation Canvas Container */}
                <XRayViewer
                    imageUrl={medicalImage.file_url}
                    title={medicalImage.title}
                    scanDate={new Date(medicalImage.scan_date).toLocaleDateString()}
                    bodyRegion={medicalImage.body_region}
                    imageType={medicalImage.image_type}
                    className="h-[650px]"
                />

                {/* Metadata & Quick Compare Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Scan Information */}
                    <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-3 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-base font-extrabold text-white">Scan Information & Findings</h3>
                            <span className="text-xs font-mono text-purple-300">
                                Scan ID #{medicalImage.id}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono pt-2">
                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Patient Name</span>
                                <span className="text-white font-bold">{medicalImage.patient?.first_name} {medicalImage.patient?.last_name}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Body Region</span>
                                <span className="text-purple-300 font-bold">{medicalImage.body_region}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Scan Date</span>
                                <span className="text-emerald-300 font-bold">{new Date(medicalImage.scan_date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {medicalImage.notes && (
                            <div className="pt-3 border-t border-white/10">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1">
                                    Radiologist & Chiropractor Findings:
                                </span>
                                <p className="text-xs text-gray-300 italic bg-black/40 p-3.5 rounded-2xl border border-white/5 leading-relaxed font-mono">
                                    "{medicalImage.notes}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick Launch Compare Box */}
                    <div className="glass-card rounded-3xl p-6 border border-purple-500/30 shadow-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                <span>🔍 Compare Before / After</span>
                            </h3>
                            <p className="text-xs text-gray-400">
                                Select another scan for this patient to open the draggable split-slider comparison workstation.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {otherScans.length === 0 ? (
                                <p className="text-xs text-amber-400 font-mono italic">
                                    No second scan available for comparison. Upload another scan to enable before/after comparison.
                                </p>
                            ) : (
                                <>
                                    <select
                                        value={selectedCompareId}
                                        onChange={(e) => setSelectedCompareId(e.target.value)}
                                        className="w-full bg-[#0b0f19] text-white rounded-xl p-3 border border-white/15 focus:border-purple-500 outline-none text-xs"
                                    >
                                        {otherScans.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.title} ({new Date(s.scan_date).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={handleLaunchCompare}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>↔️</span>
                                        <span>Open Comparison Slider</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
