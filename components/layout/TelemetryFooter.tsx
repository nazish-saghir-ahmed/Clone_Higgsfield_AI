"use client";

import React from "react";
import { Activity, Clock, CheckCircle2, AlertCircle, XCircle, Sparkles } from "lucide-react";
import { formatSeconds } from "@/lib/utils";

interface TelemetryFooterProps {
  isGenerating?: boolean;
  statusText?: string;
  progress?: number;
  elapsedSeconds?: number;
  activeModelName?: string;
  resolution?: string;
  onCancel?: () => void;
}

export const TelemetryFooter: React.FC<TelemetryFooterProps> = ({
  isGenerating = false,
  statusText = "Ready for synthesis",
  progress = 0,
  elapsedSeconds = 0,
  activeModelName = "Flux Dev",
  resolution = "1K",
  onCancel,
}) => {
  return (
    <footer className="relative z-20 flex flex-col bg-[#0a0c13]/90 border-t border-white/10 backdrop-blur-xl">
      {/* LaserFlow Progress Bar when active */}
      {isGenerating && (
        <div className="w-full h-[3px] overflow-hidden bg-white/5">
          <div
            className="h-full laser-flow-bar transition-all duration-300"
            style={{ width: `${Math.max(5, Math.round((progress || 0) * 100))}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-2.5 text-xs">
        {/* Left Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <span className="relative flex w-2.5 h-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-accent-cyan" />
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            )}
            <span className={`font-mono ${isGenerating ? "text-accent-cyan font-semibold" : "text-slate-400"}`}>
              {statusText}
            </span>
          </div>

          {isGenerating && elapsedSeconds > 0 && (
            <div className="flex items-center gap-1 font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatSeconds(elapsedSeconds)}</span>
            </div>
          )}

          {isGenerating && onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors"
            >
              <XCircle className="w-3 h-3" />
              <span>Abort</span>
            </button>
          )}
        </div>

        {/* Right Telemetry Specs */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span className="hidden sm:inline">Model: <strong className="text-slate-300">{activeModelName}</strong></span>
          <span className="hidden sm:inline">Res: <strong className="text-slate-300">{resolution}</strong></span>
          <span className="text-accent-cyan/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Aether v1.0 Clean-Room
          </span>
        </div>
      </div>
    </footer>
  );
};
