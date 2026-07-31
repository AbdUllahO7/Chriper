import React, { useState } from 'react';
import BodyPainDiagram, { PainPoint, getSeverityColor, PAIN_TYPES } from './BodyPainDiagram';

export interface MedicalRecordPainRecord {
    id: number;
    record_date: string;
    chief_complaint: string;
    pain_level: number;
    doctor?: { name: string };
    pain_diagram_data?: PainPoint[] | null;
}

interface PainHistoryTimelineProps {
    medicalRecords: MedicalRecordPainRecord[];
}

export default function PainHistoryTimeline({ medicalRecords }: PainHistoryTimelineProps) {
    const recordsWithDiagrams = medicalRecords.filter(
        (r) => r.pain_diagram_data && Array.isArray(r.pain_diagram_data) && r.pain_diagram_data.length > 0
    );

    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(
        recordsWithDiagrams[0]?.id || medicalRecords[0]?.id || null
    );

    const selectedRecord = medicalRecords.find((r) => r.id === selectedRecordId) || recordsWithDiagrams[0] || medicalRecords[0];

    // Compute metrics
    const initialRecord = recordsWithDiagrams[recordsWithDiagrams.length - 1] || medicalRecords[medicalRecords.length - 1];
    const latestRecord = recordsWithDiagrams[0] || medicalRecords[0];

    const initialPain = initialRecord?.pain_level ?? 0;
    const latestPain = latestRecord?.pain_level ?? 0;
    const painDifference = initialPain - latestPain;

    return (
        <div className="space-y-6">
            {/* Summary Statistics Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase block">Initial Visit Pain</span>
                        <span className="text-2xl font-extrabold text-white mt-1 block">
                            {initialPain} <span className="text-xs text-gray-400 font-normal">/ 10</span>
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold">
                        📊
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase block">Latest Visit Pain</span>
                        <span className="text-2xl font-extrabold text-white mt-1 block">
                            {latestPain} <span className="text-xs text-gray-400 font-normal">/ 10</span>
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                        🩺
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase block">Overall Improvement</span>
                        <span className={`text-2xl font-extrabold mt-1 block ${painDifference >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {painDifference >= 0 ? `-${painDifference} pts` : `+${Math.abs(painDifference)} pts`}
                        </span>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${painDifference >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'}`}>
                        {painDifference >= 0 ? '📈' : '⚠️'}
                    </div>
                </div>
            </div>

            {/* Timeline Selector Bar */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Clinical Visit History Timeline ({medicalRecords.length} Sessions)
                </h4>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {medicalRecords.map((rec) => {
                        const isSelected = rec.id === selectedRecord?.id;
                        const hasDiagram = rec.pain_diagram_data && Array.isArray(rec.pain_diagram_data) && rec.pain_diagram_data.length > 0;
                        const painColors = getSeverityColor(rec.pain_level);

                        return (
                            <button
                                key={rec.id}
                                type="button"
                                onClick={() => setSelectedRecordId(rec.id)}
                                className={`flex-shrink-0 p-3.5 rounded-xl border text-left transition-all duration-200 min-w-[170px] ${
                                    isSelected
                                        ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-mono text-gray-300">
                                        {new Date(rec.record_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className={`w-5 h-5 rounded-full ${painColors.bg} text-white text-[10px] font-bold flex items-center justify-center`}>
                                        {rec.pain_level}
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                                    {rec.chief_complaint}
                                </p>
                                {hasDiagram && (
                                    <span className="inline-block text-[10px] text-purple-300 font-mono mt-1">
                                        📍 {rec.pain_diagram_data?.length} pain pins
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Record Diagram & Details */}
            {selectedRecord && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <span>Pain Map for Visit on {new Date(selectedRecord.record_date).toLocaleDateString()}</span>
                            {selectedRecord.doctor && (
                                <span className="text-xs font-normal text-gray-400">
                                    (Attending: {selectedRecord.doctor.name})
                                </span>
                            )}
                        </h4>
                    </div>

                    <BodyPainDiagram
                        value={selectedRecord.pain_diagram_data || []}
                        readOnly={true}
                    />
                </div>
            )}
        </div>
    );
}
