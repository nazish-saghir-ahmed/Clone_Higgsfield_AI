"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paintbrush, Eraser, Trash2, ArrowUpRight, Check, Compass } from "lucide-react";
import { computeMotionVector, drawDirectionalArrow, exportBinaryMaskDataUrl } from "@/lib/motion-brush";
import { MotionVector } from "@/lib/types";

interface MotionBrushCanvasProps {
  backgroundImageUrl: string;
  onApplyTrajectory: (maskDataUrl: string, vector: MotionVector) => void;
  onCancel?: () => void;
}

export const MotionBrushCanvas: React.FC<MotionBrushCanvasProps> = ({
  backgroundImageUrl,
  onApplyTrajectory,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(35);
  const [angleDegrees, setAngleDegrees] = useState(45);
  const [intensity, setIntensity] = useState(7);
  const [arrowPoints, setArrowPoints] = useState<Array<{ x: number; y: number }>>([]);

  const vector = computeMotionVector(angleDegrees, intensity);

  // Initialize canvas dimensions to match image natural aspect ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    const arrowCanvas = arrowCanvasRef.current;
    if (!canvas || !arrowCanvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      arrowCanvas.width = img.width;
      arrowCanvas.height = img.height;
      redrawArrows();
    };
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  // Redraw arrows when angle or points change
  useEffect(() => {
    redrawArrows();
  }, [angleDegrees, intensity, arrowPoints]);

  const redrawArrows = () => {
    const arrowCanvas = arrowCanvasRef.current;
    if (!arrowCanvas) return;
    const ctx = arrowCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
    for (const pt of arrowPoints) {
      drawDirectionalArrow(ctx, pt.x, pt.y, angleDegrees, 25 + intensity * 2, "#00dbe9");
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    draw(x, y);

    // Sample arrow location every 50px
    if (tool === "brush") {
      setArrowPoints((prev) => {
        const last = prev[prev.length - 1];
        if (!last || Math.hypot(last.x - x, last.y - y) > 60) {
          return [...prev, { x, y }];
        }
        return prev;
      });
    }
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0, 219, 233, 0.65)";
      ctx.shadowColor = "#00dbe9";
      ctx.shadowBlur = 10;
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
    }

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    draw(x, y);

    if (tool === "brush") {
      setArrowPoints((prev) => {
        const last = prev[prev.length - 1];
        if (!last || Math.hypot(last.x - x, last.y - y) > 60) {
          return [...prev, { x, y }];
        }
        return prev;
      });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const arrowCanvas = arrowCanvasRef.current;
    if (!canvas || !arrowCanvas) return;
    const ctx = canvas.getContext("2d");
    const aCtx = arrowCanvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    aCtx?.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
    setArrowPoints([]);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const binaryMask = exportBinaryMaskDataUrl(canvas);
    onApplyTrajectory(binaryMask, vector);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0f111a] flex flex-col shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool("brush")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === "brush"
                ? "bg-accent-cyan text-black shadow-md font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Brush</span>
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === "eraser"
                ? "bg-accent-cyan text-black shadow-md font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
            title="Clear Mask"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Size: {brushSize}px</span>
          <input
            type="range"
            min="5"
            max="80"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20 accent-accent-cyan cursor-pointer"
          />
        </div>

        {/* Trajectory Angle & Intensity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-[11px] text-slate-400">Angle: {angleDegrees}°</span>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={angleDegrees}
              onChange={(e) => setAngleDegrees(parseInt(e.target.value))}
              className="w-20 accent-accent-cyan cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Speed: {intensity}</span>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-16 accent-accent-lime cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Painting Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video flex items-center justify-center bg-black/60 overflow-hidden select-none"
      >
        {/* Background Image Layer */}
        <img
          src={backgroundImageUrl}
          alt="Start Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80"
        />

        {/* Painted Mask Canvas Layer */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 w-full h-full object-contain cursor-crosshair z-10"
        />

        {/* Directional Vector Arrows Canvas Layer */}
        <canvas
          ref={arrowCanvasRef}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
        />
      </div>

      {/* Bottom Trajectory Telemetry & Action Bar */}
      <div className="flex items-center justify-between p-3 bg-black/40 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Vector: dx = <strong className="text-accent-cyan">{vector.dx}</strong>, dy = <strong className="text-accent-cyan">{vector.dy}</strong></span>
          <span>Intensity: <strong className="text-accent-lime">{vector.intensity}/10</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-black bg-gradient-to-r from-accent-cyan to-accent-lime rounded-xl hover:shadow-[0_0_15px_rgba(0,219,233,0.4)] transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Trajectory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
