import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CompareView, { CompareImageItem } from '@/Components/CompareView';
import { Head, Link } from '@inertiajs/react';

interface CompareProps {
    imageA: CompareImageItem;
    imageB: CompareImageItem;
}

export default function Compare({ imageA, imageB }: CompareProps) {
    if (!imageA || !imageB) {
        return (
            <AuthenticatedLayout
                header={
                    <h1 className="text-2xl font-extrabold text-white">Compare Medical Scans</h1>
                }
            >
                <div className="glass-card rounded-3xl p-12 text-center border border-white/10 space-y-4">
                    <p className="text-sm text-gray-400">
                        Please select 2 valid medical images to compare.
                    </p>
                    <Link
                        href={route('medical-images.index')}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs inline-block"
                    >
                        ← Back to Imaging Gallery
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

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
                                Before / After <span className="gradient-text">Radiograph Comparison</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Evaluating spinal alignment changes for {imageA.patient?.first_name} {imageA.patient?.last_name}.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Before/After Radiograph Comparison Workstation" />

            <div className="space-y-6">
                <CompareView imageA={imageA} imageB={imageB} />
            </div>
        </AuthenticatedLayout>
    );
}
