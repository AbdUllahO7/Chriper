import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface PdfViewProps {
    range: string;
    tab: string;
    generatedAt: string;
}

export default function PdfView({ range, tab, generatedAt }: PdfViewProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('reports.index', { tab, range })}
                            className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Reports Hub
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Export PDF <span className="gradient-text">Report</span>
                            </h1>
                            <p className="text-sm text-gray-400">
                                Printable document for {tab.toUpperCase()} report ({range.replace('_', ' ')}).
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 active:scale-95 flex items-center gap-2"
                    >
                        <span>🖨️ Print / Save as PDF</span>
                    </button>
                </div>
            }
        >
            <Head title={`Clinical Report - ${tab.toUpperCase()}`} />

            <div className="max-w-4xl mx-auto bg-[#0d121f] print:bg-white text-white print:text-black rounded-3xl p-8 sm:p-12 border border-white/10 print:border-none shadow-2xl space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/10 print:border-gray-300 pb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white print:text-purple-900">
                            CHIRPER <span className="text-purple-400 print:text-purple-600">SPINE CLINIC</span>
                        </h2>
                        <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
                            Official Executive Clinical & Financial Report
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold uppercase text-purple-400 print:text-purple-800 block">
                            {tab.replace('_', ' ')} REPORT
                        </span>
                        <span className="text-xs text-gray-400 print:text-gray-600 block mt-0.5">
                            Timeframe: {range.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-[11px] text-gray-400 print:text-gray-500 block">
                            Generated: {generatedAt}
                        </span>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] print:bg-gray-100 border border-white/10 print:border-gray-300 space-y-3 text-sm">
                    <h3 className="text-base font-bold text-white print:text-black">Executive Summary</h3>
                    <p className="text-gray-300 print:text-gray-800 leading-relaxed">
                        This document contains the generated executive snapshot for the <strong>{tab}</strong> report covering period <strong>{range.replace('_', ' ')}</strong>. All metrics have been verified from clinic database records.
                    </p>
                </div>

                <div className="text-center text-xs text-gray-400 print:text-gray-500 pt-8 border-t border-white/10 print:border-gray-300">
                    Chirper Spine Clinic • 100 Health Care Boulevard, Suite 400 • Confidential Report
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
