import React, { useState, useRef, useEffect } from 'react';
import XRayViewer from './XRayViewer';

export interface CompareImageItem {
    id: number;
    title: string;
    image_type: 'xray' | 'mri' | 'ct_scan';
    body_region: string;
    scan_date: string;
    file_url: string;
    notes?: string | null;
    patient?: { first_name: string; last_name: string };
}

interface CompareViewProps {
    imageA: CompareImageItem;
    imageB: CompareImageItem;
}

export default function CompareView({ imageA, imageB }: CompareViewProps) {
    const [mode, setMode] = useState<'slider' | 'side_by_side'>('slider');
    const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
    const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

    const sliderContainerRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingSlider || !sliderContainerRef.current) return;
        const rect = sliderContainerRef.current.getBoundingClientRect();
        let clientX = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }

        const x = clientX - rect.left;
        const pct = Math.min(Math.max((x / rect.width) * 100, 0), 100);
        setSliderPos(pct);
    };

    const handleMouseUp = () => setIsDraggingSlider(false);

    return (
        <div className="space-y-6">
            {/* Control Bar & Mode Switcher */}
            <div className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                        <span>🔍 Before / After Radiograph Comparison</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Comparing pre-treatment vs post-treatment spinal adjustments for {imageA.patient?.first_name} {imageA.patient?.last_name}.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-[#0b0f19] p-1.5 rounded-2xl border border-white/15">
                    <button
                        type="button"
                        onClick={() => setMode('slider')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            mode === 'slider'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        ↔️ Draggable Split Slider
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('side_by_side')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            mode === 'side_by_side'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        ⏸️ Side-by-Side View
                    </button>
                </div>
            </div>

            {/* Comparison Viewport Container */}
            {mode === 'slider' ? (
                /* Draggable Split-Slider Mode */
                <div
                    ref={sliderContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    className="relative w-full h-[600px] bg-slate-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl select-none cursor-ew-resize"
                >
                    {/* Image B (Post-Treatment - Full Background) */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black p-4">
                        <img
                            src={imageB.file_url}
                            alt={imageB.title}
                            className="max-w-full max-h-full object-contain pointer-events-none"
                        />
                        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-emerald-300 font-bold">
                            Post-Treatment: {new Date(imageB.scan_date).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Image A (Pre-Treatment - Clipped Curtain Layer) */}
                    <div
                        style={{ width: `${sliderPos}%` }}
                        className="absolute inset-y-0 left-0 h-full overflow-hidden bg-black flex items-center justify-center border-r-2 border-purple-500 shadow-2xl z-10"
                    >
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
                            <img
                                src={imageA.file_url}
                                alt={imageA.title}
                                className="max-w-full max-h-full object-contain pointer-events-none"
                            />
                        </div>
                        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-purple-300 font-bold z-20">
                            Pre-Treatment: {new Date(imageA.scan_date).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Interactive Draggable Slider Handle */}
                    <div
                        style={{ left: `${sliderPos}%` }}
                        onMouseDown={() => setIsDraggingSlider(true)}
                        onTouchStart={() => setIsDraggingSlider(true)}
                        className="absolute top-0 bottom-0 z-30 -ml-4 flex items-center justify-center cursor-ew-resize"
                    >
                        <div className="w-8 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xl ring-4 ring-white/20">
                            ↔
                        </div>
                    </div>
                </div>
            ) : (
                /* Side-by-Side Dual Viewport Mode */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold px-2">
                            <span>PRE-TREATMENT SCAN</span>
                            <span>{new Date(imageA.scan_date).toLocaleDateString()}</span>
                        </div>
                        <XRayViewer
                            imageUrl={imageA.file_url}
                            title={`Pre: ${imageA.title}`}
                            scanDate={new Date(imageA.scan_date).toLocaleDateString()}
                            bodyRegion={imageA.body_region}
                            imageType={imageA.image_type}
                            className="h-[520px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold px-2">
                            <span>POST-TREATMENT SCAN</span>
                            <span>{new Date(imageB.scan_date).toLocaleDateString()}</span>
                        </div>
                        <XRayViewer
                            imageUrl={imageB.file_url}
                            title={`Post: ${imageB.title}`}
                            scanDate={new Date(imageB.scan_date).toLocaleDateString()}
                            bodyRegion={imageB.body_region}
                            imageType={imageB.image_type}
                            className="h-[520px]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
