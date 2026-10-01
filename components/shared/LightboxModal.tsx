"use client";

import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Copy, Check } from "lucide-react";
import { downloadMediaAsset } from "@/lib/utils";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType?: "image" | "video";
  prompt?: string;
  modelName?: string;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType = "image",
  prompt,
  modelName,
}) => {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setCopied(false);
    }
  }, [isOpen, mediaUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mediaUrl) return null;

  const handleCopyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isVideo = mediaType === "video" || mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between p-3 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg">
            {modelName || "Aether Neural Render"}
          </div>
          {prompt && (
            <p className="max-w-md text-xs text-slate-300 truncate hidden md:block" title={prompt}>
              {prompt}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isVideo && (
            <>
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale(1)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}

          {prompt && (
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Copy Prompt"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Prompt"}</span>
            </button>
          )}

          <button
            onClick={() => downloadMediaAsset(mediaUrl, isVideo ? "aether-video.mp4" : "aether-render.png")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-accent-cyan hover:bg-accent-cyan/90 rounded-lg transition-colors"
            title="Download Media"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden select-none">
        {isVideo ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            loop
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10 object-contain"
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Aether Neural Render"
            style={{
              transform: `scale(${scale})`,
              transition: "transform 0.15s ease-out",
            }}
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10 object-contain cursor-grab active:cursor-grabbing"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
};
