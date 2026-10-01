"use client";

import React, { useState, useEffect } from "react";
import { Mic, Volume2, Sparkles, Zap, Music } from "lucide-react";

interface CinematicLipSyncHeroProps {
  onUsePrompt?: (promptText: string) => void;
}

export const CinematicLipSyncHero: React.FC<CinematicLipSyncHeroProps> = ({
  onUsePrompt,
}) => {
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 80, 55, 90, 35, 70, 60, 85, 40, 65, 30]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 75) + 20)
      );
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const samplePrompt = "Synchronize realistic speech with natural micro-expressions, 60 FPS phoneme precision, and zero head-drift artifacts";

  return (
    <section className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-6 pb-6 select-none animate-fadeIn">
      {/* Section Header */}
      <div className="w-full max-w-6xl px-4 sm:px-6 mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-purple-400 mb-1.5">
            <Music className="w-3.5 h-3.5" />
            <span>Acoustic Viseme Benchmarks</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Lip Sync & Audio-Visual Alignment
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Dynamic acoustic phoneme & facial tracking simulation
        </p>
      </div>

      <div className="w-full max-w-6xl px-3 sm:px-6 z-10">
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-white/[0.02] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
          <div className="relative rounded-[23px] overflow-hidden bg-[#06080d] aspect-[16/9] sm:aspect-[21/10] md:aspect-[2.35/1] max-h-[65vh] flex items-center justify-center">
            
            <img
              src="/images/showcase-lipsync.jpg"
              alt="Lip Sync Facial Animation"
              className="w-full h-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/95 via-transparent to-[#050609]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/60 via-transparent to-[#050609]/60 pointer-events-none" />

            {/* Top-Left Live HUD Badge */}
            <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-80" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-cyan" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-slate-200 uppercase">
                Acoustic Phoneme Synthesis // LivePortrait Pro
              </span>
            </div>

            {/* Top-Right Badge */}
            <div className="hidden sm:flex absolute top-4 right-6 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] font-mono text-slate-300">
                48 kHz High Fidelity • Phoneme Sync 99.4%
              </span>
            </div>

            {/* Center Dynamic Audio Waveform Overlay */}
            <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-cyan-400/30 shadow-2xl">
              <Volume2 className="w-4 h-4 text-accent-cyan mr-1.5 animate-pulse" />
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-accent-cyan to-indigo-400 rounded-full transition-all duration-150"
                  style={{ height: `${h * 0.35}px` }}
                />
              ))}
              <span className="text-[11px] font-mono text-cyan-300 ml-2 font-medium">Synced</span>
            </div>

            {/* Bottom Caption & Trigger */}
            <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-slate-200 line-clamp-1 max-w-xl">
                &ldquo;{samplePrompt}&rdquo;
              </p>
              {onUsePrompt && (
                <button
                  type="button"
                  onClick={() => onUsePrompt(samplePrompt)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-xs font-semibold text-white whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Use Voice Setup</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
