import React, { useState } from 'react';

export interface PainPoint {
    id: string;
    view: 'front' | 'back';
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    body_part: string;
    severity: number; // 1 - 10
    pain_type: 'sharp' | 'dull' | 'throbbing' | 'burning' | 'numbness' | 'stiffness';
    notes: string;
}

interface BodyPainDiagramProps {
    value?: PainPoint[];
    onChange?: (points: PainPoint[]) => void;
    readOnly?: boolean;
    heightClass?: string;
}

export const PAIN_TYPES = [
    { value: 'sharp', label: 'Sharp / Stabbing', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { value: 'dull', label: 'Dull / Aching', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { value: 'throbbing', label: 'Throbbing / Pulsing', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { value: 'burning', label: 'Burning / Hot', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { value: 'numbness', label: 'Numbness / Tingling', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { value: 'stiffness', label: 'Stiffness / Restricted', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

export const getSeverityColor = (severity: number) => {
    if (severity <= 3) return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', ring: 'ring-emerald-500/40', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]' };
    if (severity <= 6) return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500', ring: 'ring-amber-500/40', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]' };
    if (severity <= 8) return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', ring: 'ring-orange-500/40', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.6)]' };
    return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', ring: 'ring-red-500/40', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]' };
};

// Helper function to approximate body region based on view, x, and y coordinates
const detectBodyRegion = (view: 'front' | 'back', x: number, y: number): string => {
    if (y < 16) return view === 'front' ? 'Head / Facial Area' : 'Occipital / Cervical Spine';
    if (y < 26) return view === 'front' ? 'Anterior Neck / Throat' : 'Cervical Spine (C1-C7)';
    if (y < 42) {
        if (x < 35) return view === 'front' ? 'Right Shoulder / Deltoid' : 'Right Scapula / Shoulder Blade';
        if (x > 65) return view === 'front' ? 'Left Shoulder / Deltoid' : 'Left Scapula / Shoulder Blade';
        return view === 'front' ? 'Chest / Pectoral Region' : 'Thoracic Spine (T1-T12)';
    }
    if (y < 58) {
        if (x < 28) return 'Right Arm / Elbow';
        if (x > 72) return 'Left Arm / Elbow';
        return view === 'front' ? 'Abdomen / Core' : 'Lumbar Spine (L1-L5)';
    }
    if (y < 70) {
        if (x < 35) return 'Right Hip / Pelvis';
        if (x > 65) return 'Left Hip / Pelvis';
        return view === 'front' ? 'Lower Abdomen / Groin' : 'Sacroiliac (SI) Joint / Sacrum';
    }
    if (y < 86) {
        if (x < 50) return 'Right Quadriceps / Thigh';
        return 'Left Quadriceps / Thigh';
    }
    if (x < 50) return view === 'front' ? 'Right Shin / Ankle' : 'Right Calf / Achilles';
    return view === 'front' ? 'Left Shin / Ankle' : 'Left Calf / Achilles';
};

export default function BodyPainDiagram({
    value = [],
    onChange,
    readOnly = false,
    heightClass = 'min-h-[480px]',
}: BodyPainDiagramProps) {
    const [view, setView] = useState<'front' | 'back'>('back');
    const [activePoint, setActivePoint] = useState<PainPoint | null>(null);
    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

    // Form state for creating/editing pin
    const [editBodyPart, setEditBodyPart] = useState('');
    const [editSeverity, setEditSeverity] = useState<number>(5);
    const [editPainType, setEditPainType] = useState<PainPoint['pain_type']>('sharp');
    const [editNotes, setEditNotes] = useState('');

    const currentViewPoints = value.filter((p) => p.view === view);

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (readOnly) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const rawX = ((e.clientX - rect.left) / rect.width) * 100;
        const rawY = ((e.clientY - rect.top) / rect.height) * 100;

        const x = Math.round(rawX * 10) / 10;
        const y = Math.round(rawY * 10) / 10;

        const autoRegion = detectBodyRegion(view, x, y);

        const newPoint: PainPoint = {
            id: `pin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            view,
            x,
            y,
            body_part: autoRegion,
            severity: 5,
            pain_type: 'sharp',
            notes: '',
        };

        setActivePoint(newPoint);
        setEditBodyPart(newPoint.body_part);
        setEditSeverity(newPoint.severity);
        setEditPainType(newPoint.pain_type);
        setEditNotes(newPoint.notes);
        setIsEditingModalOpen(true);
    };

    const handleSelectPin = (point: PainPoint, e: React.MouseEvent) => {
        e.stopPropagation();
        setActivePoint(point);
        setEditBodyPart(point.body_part);
        setEditSeverity(point.severity);
        setEditPainType(point.pain_type);
        setEditNotes(point.notes);
        setIsEditingModalOpen(true);
    };

    const handleSavePin = () => {
        if (!activePoint || !onChange) return;

        const updatedPoint: PainPoint = {
            ...activePoint,
            body_part: editBodyPart.trim() || 'Unspecified Area',
            severity: editSeverity,
            pain_type: editPainType,
            notes: editNotes.trim(),
        };

        const existingIndex = value.findIndex((p) => p.id === activePoint.id);
        let newPoints: PainPoint[];

        if (existingIndex >= 0) {
            newPoints = [...value];
            newPoints[existingIndex] = updatedPoint;
        } else {
            newPoints = [...value, updatedPoint];
        }

        onChange(newPoints);
        setIsEditingModalOpen(false);
        setActivePoint(null);
    };

    const handleDeletePin = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (readOnly || !onChange) return;

        const filtered = value.filter((p) => p.id !== id);
        onChange(filtered);
        if (activePoint?.id === id) {
            setIsEditingModalOpen(false);
            setActivePoint(null);
        }
    };

    return (
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl relative space-y-5">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">Interactive Body Pain Diagram</h3>
                        <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {value.length} Pain {value.length === 1 ? 'Area' : 'Areas'} Marked
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        {readOnly
                            ? 'Click any pin to inspect severity ratings, pain types, and clinical notes.'
                            : 'Click anywhere on the body silhouette to place or edit a pain marker pin.'}
                    </p>
                </div>

                {/* View Switcher (Front vs Back) */}
                <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 shrink-0">
                    <button
                        type="button"
                        onClick={() => setView('front')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            view === 'front'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Anterior (Front)
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('back')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            view === 'back'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Posterior (Back)
                    </button>
                </div>
            </div>

            {/* Main Interactive Diagram Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Visual Body Canvas Column (7 cols on md, 8 cols on lg) */}
                <div className={`md:col-span-7 lg:col-span-8 relative flex items-center justify-center bg-slate-950/70 rounded-2xl p-4 border border-white/5 ${heightClass} select-none overflow-hidden`}>
                    {/* View Label Overlay */}
                    <div className="absolute top-4 left-4 text-xs font-mono font-bold tracking-wider uppercase text-purple-400 bg-purple-950/50 px-3 py-1 rounded-lg border border-purple-500/20 backdrop-blur-md z-10">
                        {view === 'front' ? 'Anterior (Front) View' : 'Posterior (Back) View'}
                    </div>

                    {/* SVG Human Silhouette Graphic */}
                    <svg
                        viewBox="0 0 200 420"
                        className={`w-full max-w-[280px] h-[390px] ${!readOnly ? 'cursor-crosshair' : ''}`}
                        onClick={handleCanvasClick}
                    >
                        <defs>
                            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#312e81" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Outer Body Outline Path */}
                        {view === 'front' ? (
                            /* Anterior / Front Silhouette */
                            <g filter="url(#glow)">
                                {/* Head & Neck */}
                                <ellipse cx="100" cy="35" rx="22" ry="26" fill="url(#bodyGrad)" stroke="#6366f1" strokeWidth="1.5" />
                                <rect x="91" y="60" width="18" height="18" rx="4" fill="url(#bodyGrad)" stroke="#6366f1" strokeWidth="1.2" />

                                {/* Shoulders & Torso */}
                                <path
                                    d="M 52 82 C 70 76, 130 76, 148 82 L 158 135 C 160 148, 162 165, 154 175 C 146 172, 142 165, 140 152 L 138 185 C 136 210, 134 235, 130 250 L 70 250 C 66 235, 64 210, 62 185 L 60 152 C 58 165, 54 172, 46 175 C 38 165, 40 148, 42 135 Z"
                                    fill="url(#bodyGrad)"
                                    stroke="#6366f1"
                                    strokeWidth="1.5"
                                />

                                {/* Arms */}
                                <path d="M 44 140 L 28 210 C 25 225, 20 240, 22 250 C 26 250, 30 245, 34 230 L 46 175 Z" fill="url(#bodyGrad)" stroke="#6366f1" strokeWidth="1.2" />
                                <path d="M 156 140 L 172 210 C 175 225, 180 240, 178 250 C 174 250, 170 245, 166 230 L 154 175 Z" fill="url(#bodyGrad)" stroke="#6366f1" strokeWidth="1.2" />

                                {/* Pelvis & Legs */}
                                <path
                                    d="M 70 250 L 66 330 L 68 395 L 85 395 L 94 330 L 98 265 L 102 265 L 106 330 L 115 395 L 132 395 L 134 330 L 130 250 Z"
                                    fill="url(#bodyGrad)"
                                    stroke="#6366f1"
                                    strokeWidth="1.5"
                                />

                                {/* Anatomical Reference Guides (Subtle Chest / Knees lines) */}
                                <line x1="72" y1="115" x2="128" y2="115" stroke="#818cf8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                                <line x1="75" y1="150" x2="125" y2="150" stroke="#818cf8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                                <circle cx="80" cy="330" r="7" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.4" />
                                <circle cx="120" cy="330" r="7" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.4" />
                            </g>
                        ) : (
                            /* Posterior / Back Silhouette with Vertebral Column Guide */
                            <g filter="url(#glow)">
                                {/* Head & Cervical Neck */}
                                <ellipse cx="100" cy="35" rx="22" ry="26" fill="url(#bodyGrad)" stroke="#8b5cf6" strokeWidth="1.5" />
                                <rect x="91" y="60" width="18" height="18" rx="4" fill="url(#bodyGrad)" stroke="#8b5cf6" strokeWidth="1.2" />

                                {/* Shoulders, Scapulae & Back */}
                                <path
                                    d="M 52 82 C 70 76, 130 76, 148 82 L 158 135 C 160 148, 162 165, 154 175 C 146 172, 142 165, 140 152 L 138 185 C 136 210, 134 235, 130 250 L 70 250 C 66 235, 64 210, 62 185 L 60 152 C 58 165, 54 172, 46 175 C 38 165, 40 148, 42 135 Z"
                                    fill="url(#bodyGrad)"
                                    stroke="#8b5cf6"
                                    strokeWidth="1.5"
                                />

                                {/* Arms */}
                                <path d="M 44 140 L 28 210 C 25 225, 20 240, 22 250 C 26 250, 30 245, 34 230 L 46 175 Z" fill="url(#bodyGrad)" stroke="#8b5cf6" strokeWidth="1.2" />
                                <path d="M 156 140 L 172 210 C 175 225, 180 240, 178 250 C 174 250, 170 245, 166 230 L 154 175 Z" fill="url(#bodyGrad)" stroke="#8b5cf6" strokeWidth="1.2" />

                                {/* Glutes & Posterior Legs */}
                                <path
                                    d="M 70 250 L 66 330 L 68 395 L 85 395 L 94 330 L 98 265 L 102 265 L 106 330 L 115 395 L 132 395 L 134 330 L 130 250 Z"
                                    fill="url(#bodyGrad)"
                                    stroke="#8b5cf6"
                                    strokeWidth="1.5"
                                />

                                {/* Spinal Column Guide Lines (Cervical C1-C7, Thoracic T1-T12, Lumbar L1-L5, Sacrum) */}
                                <line x1="100" y1="60" x2="100" y2="250" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4 2" opacity="0.7" />
                                {/* Scapula Outlines */}
                                <path d="M 68 100 Q 78 120 72 135" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
                                <path d="M 132 100 Q 122 120 128 135" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
                                {/* Lumbar Curve Guide */}
                                <path d="M 98 185 Q 100 200 98 215" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.5" />
                            </g>
                        )}

                        {/* Render Pinned Pain Markers for Current View */}
                        {currentViewPoints.map((point) => {
                            const colors = getSeverityColor(point.severity);
                            const svgX = (point.x / 100) * 200;
                            const svgY = (point.y / 100) * 420;

                            return (
                                <g
                                    key={point.id}
                                    transform={`translate(${svgX}, ${svgY})`}
                                    className="cursor-pointer group"
                                    onClick={(e) => handleSelectPin(point, e)}
                                >
                                    {/* Pulse Glow Effect */}
                                    <circle r="14" className={`${colors.bg} opacity-30 animate-ping`} />
                                    <circle r="10" className={`${colors.bg} opacity-50`} />

                                    {/* Pin Core Circle */}
                                    <circle
                                        r="7"
                                        className={`${colors.bg} stroke-white stroke-2 shadow-lg transition-transform duration-200 group-hover:scale-125`}
                                    />

                                    {/* Severity Rating Number Inside Pin */}
                                    <text
                                        y="3.5"
                                        textAnchor="middle"
                                        className="fill-white text-[9px] font-extrabold font-mono pointer-events-none"
                                    >
                                        {point.severity}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Canvas Instruction Footnote */}
                    {!readOnly && (
                        <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                            Click silhouette to add pin
                        </div>
                    )}
                </div>

                {/* Pain Points List & Clinical Summary Sidebar (5 cols on md, 4 cols on lg) */}
                <div className="md:col-span-5 lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            Marked Pain Locations ({currentViewPoints.length})
                        </h4>
                        {!readOnly && value.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onChange && onChange([])}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {currentViewPoints.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-lg">
                                📍
                            </div>
                            <p className="text-xs font-semibold text-gray-300">No pain points marked for this view</p>
                            <p className="text-[11px] text-gray-400">
                                {readOnly
                                    ? 'No anatomical pain points were recorded in this record.'
                                    : `Switch between Front and Back views or click on the body image to mark pain zones.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {currentViewPoints.map((pt) => {
                                const colors = getSeverityColor(pt.severity);
                                const pType = PAIN_TYPES.find((t) => t.value === pt.pain_type);

                                return (
                                    <div
                                        key={pt.id}
                                        onClick={(e) => handleSelectPin(pt, e)}
                                        className="p-3.5 rounded-2xl glass-card border border-white/10 hover:border-purple-500/40 transition-all duration-200 cursor-pointer space-y-2 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`w-6 h-6 rounded-full ${colors.bg} text-white font-mono text-xs font-extrabold flex items-center justify-center shadow-md`}
                                                >
                                                    {pt.severity}
                                                </span>
                                                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                                                    {pt.body_part}
                                                </span>
                                            </div>

                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeletePin(pt.id, e)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors text-xs p-1"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${pType?.color || 'bg-gray-500/20 text-gray-300'}`}>
                                                {pType?.label || pt.pain_type}
                                            </span>
                                            <span className="text-[11px] text-gray-400 font-mono">
                                                Level {pt.severity}/10
                                            </span>
                                        </div>

                                        {pt.notes && (
                                            <p className="text-xs text-gray-300 bg-black/30 p-2 rounded-xl border border-white/5 italic">
                                                "{pt.notes}"
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Pin Creation / Editing Modal Popover */}
            {isEditingModalOpen && activePoint && !readOnly && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="glass-card rounded-3xl p-6 border border-white/20 shadow-2xl max-w-md w-full space-y-5 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span>📍 Pain Area Details</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 capitalize font-mono">
                                    {activePoint.view} View
                                </span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditingModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body Region Name Input */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-300 mb-1.5">
                                Anatomical Body Region / Part
                            </label>
                            <input
                                type="text"
                                value={editBodyPart}
                                onChange={(e) => setEditBodyPart(e.target.value)}
                                placeholder="e.g. Lumbar L4-L5, Right Shoulder"
                                className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        {/* Pain Severity Slider (1 - 10) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold uppercase text-gray-300">
                                    Pain Severity Level
                                </label>
                                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${getSeverityColor(editSeverity).bg} text-white`}>
                                    {editSeverity} / 10
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={editSeverity}
                                onChange={(e) => setEditSeverity(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                                <span>1 (Mild)</span>
                                <span>5 (Moderate)</span>
                                <span>10 (Severe)</span>
                            </div>
                        </div>

                        {/* Pain Type Selector */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-300 mb-1.5">
                                Quality of Pain
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {PAIN_TYPES.map((pt) => (
                                    <button
                                        type="button"
                                        key={pt.value}
                                        onClick={() => setEditPainType(pt.value as PainPoint['pain_type'])}
                                        className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                                            editPainType === pt.value
                                                ? `${pt.color} ring-2 ring-purple-500/50 shadow-md`
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {pt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clinical Notes */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-300 mb-1.5">
                                Clinical Area Notes
                            </label>
                            <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                rows={3}
                                placeholder="Describe pain onset, triggers, radiation patterns..."
                                className="w-full bg-slate-900/80 border border-white/15 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => handleDeletePin(activePoint.id)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                            >
                                Remove Pin
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 border border-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePin}
                                    className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/30 transition-all"
                                >
                                    Save Marker
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
