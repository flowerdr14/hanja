import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Eraser } from 'lucide-react';

interface WritingCanvasProps {
  initialDataUrl?: string;
  onChange?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  guideChar?: string;
  showGrid?: boolean;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({
  initialDataUrl,
  onChange,
  width = 160,
  height = 160,
  guideChar,
  showGrid = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor] = useState('#1e293b');
  const [lineWidth] = useState(4);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset and draw background
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasContent(true);
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl, width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && onChange) {
      onChange(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    setHasContent(false);
    if (onChange) onChange('');
  };

  return (
    <div className="inline-flex flex-col items-center">
      <div
        className="relative border-2 border-amber-900/30 rounded-lg overflow-hidden bg-amber-50/40 shadow-inner"
        style={{ width, height }}
      >
        {/* Background Grid Guide */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Center Cross Lines */}
            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-red-300/60" />
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-red-300/60" />
            {/* Diagonal Lines */}
            <svg className="absolute inset-0 w-full h-full text-red-200/40" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="0" x2={width} y2={height} stroke="currentColor" strokeDasharray="3 3" />
              <line x1={width} y1="0" x2="0" y2={height} stroke="currentColor" strokeDasharray="3 3" />
            </svg>
          </div>
        )}

        {/* Ghost Guide Character (if practice mode) */}
        {guideChar && !hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-slate-300 font-hanja text-7xl font-light">
            {guideChar}
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="relative z-10 cursor-crosshair touch-none"
        />
      </div>

      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
          <PenTool className="w-3 h-3 text-amber-700" /> 한자 필순 쓰기
        </span>
        <button
          type="button"
          onClick={clearCanvas}
          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="지우기"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
