import React, { useState, useRef, useEffect } from 'react';

interface XRayViewerProps {
    imageUrl: string;
    title?: string;
    scanDate?: string;
    bodyRegion?: string;
    imageType?: 'xray' | 'mri' | 'ct_scan';
    className?: string;
}

export default function XRayViewer({
    imageUrl,
    title = 'Radiology Scan',
    scanDate,
    bodyRegion,
    imageType = 'xray',
    className = '',
}: XRayViewerProps) {
    const [zoom, setZoom] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [brightness, setBrightness] = useState<number>(100);
    const [contrast, setContrast] = useState<number>(100);
    const [isInverted, setIsInverted] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Pan state
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 5));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleRotateCW = () => setRotation((prev) => (prev + 90) % 360);
    const handleRotateCCW = () => setRotation((prev) => (prev - 90 + 360) % 360);

    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setIsInverted(false);
        setPan({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const getImageTypeBadge = () => {
        if (imageType === 'xray') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        if (imageType === 'mri') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    };

    return (
        <div
            ref={containerRef}
            className={`relative flex flex-col bg-slate-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl ${className} ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[600px]'
            }`}
        >
            {/* Top Diagnostic Toolbar */}
            <div className="z-10 flex flex-wrap items-center justify-between p-4 bg-slate-900/90 backdrop-blur-md border-b border-white/10 text-white gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border uppercase ${getImageTypeBadge()}`}>
                        {imageType.replace('_', ' ')}
                    </span>
                    <div>
                        <h4 className="text-sm font-extrabold leading-none">{title}</h4>
                        <span className="text-[11px] text-gray-400 font-mono">
                            {bodyRegion} {scanDate ? `• ${scanDate}` : ''}
                        </span>
                    </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                    {/* Zoom Level Indicator */}
                    <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-purple-300">
                        {Math.round(zoom * 100)}%
                    </span>

                    {/* Zoom Buttons */}
                    <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5">
                        <button
                            type="button"
                            onClick={handleZoomOut}
                            title="Zoom Out"
                            className="px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                            🔍-
                        </button>
                        <button
                            type="button"
                            onClick={handleZoomIn}
                            title="Zoom In"
                            className="px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                            🔍+
                        </button>
                    </div>

                    {/* Rotation Buttons */}
                    <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5">
                        <button
                            type="button"
                            onClick={handleRotateCCW}
                            title="Rotate 90° CCW"
                            className="px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            ↺ 90°
                        </button>
                        <button
                            type="button"
                            onClick={handleRotateCW}
                            title="Rotate 90° CW"
                            className="px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            ↻ 90°
                        </button>
                    </div>

                    {/* Invert Colors Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsInverted(!isInverted)}
                        className={`px-3 py-1.5 rounded-xl border transition-all ${
                            isInverted
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                        }`}
                        title="Invert Colors (DICOM Mode)"
                    >
                        ☯️ {isInverted ? 'Inverted' : 'Normal'}
                    </button>

                    {/* Reset Button */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-white/10 transition-colors"
                    >
                        Reset
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors"
                    >
                        {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
                    </button>
                </div>
            </div>

            {/* Main Interactive Viewport Canvas */}
            <div
                className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-black flex items-center justify-center select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Image Transform Wrapper */}
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                        filter: `contrast(${contrast}%) brightness(${brightness}%) ${isInverted ? 'invert(100%)' : ''}`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out, filter 0.15s ease-out',
                    }}
                    className="max-w-full max-h-full flex items-center justify-center p-4"
                >
                    <img
                        src={imageUrl}
                        alt={title}
                        draggable={false}
                        className="max-w-full max-h-[500px] object-contain rounded-lg shadow-2xl pointer-events-none"
                    />
                </div>

                {/* Bottom Live Image Adjustment Sliders Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-2xl text-xs font-mono text-gray-300">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase font-bold text-purple-300">Contrast:</span>
                        <input
                            type="range"
                            min="50"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-24 accent-purple-500 cursor-pointer"
                        />
                        <span className="w-8 text-right">{contrast}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase font-bold text-purple-300">Brightness:</span>
                        <input
                            type="range"
                            min="50"
                            max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-24 accent-purple-500 cursor-pointer"
                        />
                        <span className="w-8 text-right">{brightness}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
