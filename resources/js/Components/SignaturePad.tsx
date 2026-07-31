import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
    value?: string | null;
    onChange?: (dataUrl: string | null) => void;
    readOnly?: boolean;
    height?: number;
}

export default function SignaturePad({
    value = null,
    onChange,
    readOnly = false,
    height = 200,
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(!value);
    const [strokes, setStrokes] = useState<ImageData[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution for crisp rendering
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = height * 2;
        ctx.scale(2, 2);

        ctx.strokeStyle = '#38bdf8'; // Electric blue signature ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw background baseline if empty and editable
        if (!value) {
            drawBaseline(ctx, rect.width, height);
        } else {
            // Load existing signature image if provided
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, rect.width, height);
                setIsEmpty(false);
            };
            img.src = value;
        }
    }, [height, value]);

    const drawBaseline = (ctx: CanvasRenderingContext2D, width: number, h: number) => {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Baseline line 35px from bottom
        const lineY = h - 35;
        ctx.beginPath();
        ctx.moveTo(30, lineY);
        ctx.lineTo(width - 30, lineY);
        ctx.stroke();

        // Sign Here marker
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('✕ Sign Here', 30, lineY - 8);
        ctx.restore();
    };

    const saveCurrentState = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokes((prev) => [...prev, imgData]);
    };

    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        saveCurrentState(canvas, ctx);

        // If drawing for the first time, clear baseline
        if (isEmpty) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setIsEmpty(false);
        }

        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing || readOnly) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (canvas && onChange) {
            const dataUrl = canvas.toDataURL('image/png');
            onChange(dataUrl);
        }
    };

    const handleClear = () => {
        if (readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBaseline(ctx, canvas.getBoundingClientRect().width, height);
        setIsEmpty(true);
        setStrokes([]);
        if (onChange) onChange(null);
    };

    return (
        <div className="space-y-3">
            <div className="relative rounded-2xl bg-slate-950/80 border border-white/15 p-2 shadow-inner overflow-hidden">
                <canvas
                    ref={canvasRef}
                    style={{ height: `${height}px` }}
                    className={`w-full ${!readOnly ? 'cursor-crosshair' : ''}`}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {!readOnly && (
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-white/10 transition-colors"
                        >
                            Clear Signature
                        </button>
                    </div>
                )}
            </div>

            {!readOnly && (
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>Draw your electronic signature inside the box using mouse or touch screen.</span>
                    <span className={isEmpty ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {isEmpty ? '⚠️ Signature Required' : '✓ Signature Captured'}
                    </span>
                </div>
            )}
        </div>
    );
}
