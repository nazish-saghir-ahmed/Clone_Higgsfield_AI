"use client";

import React, { useState, useEffect } from "react";
import { Mic, Volume2, Sparkles, ChevronDown, Zap, Music, UserCheck } from "lucide-react";

interface CinematicLipSyncHeroProps {
  onUsePrompt?: (promptText: string) => void;
  onScrollToStudio?: () => void;
}

export const CinematicLipSyncHero: React.FC<CinematicLipSyncHeroProps> = ({
  onUsePrompt,
  onScrollToStudio,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 80, 55, 90, 35, 70, 60, 85, 40, 65, 30]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Real-time audio waveform simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 75) + 20)
      );
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const maxScroll = 450;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
  const translateY = progress * -120;
  const scale = 1 - progress * 0.05;
  const opacity = Math.max(0, 1 - progress * 1.15);

  const samplePrompt = "Synchronize realistic speech with natural micro-expressions, 60 FPS phoneme precision, and zero head-drift artifacts";

  return (
    <section className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-1 sm:pt-4 pb-12 select-none">
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-[98vw] max-w-7xl h-[550px] bg-gradient-to-b from-purple-500/15 via-cyan-600/10 to-transparent blur-3xl pointer-events-none -z-10"
        style={{ opacity: Math.max(0, 1 - progress * 1.3) }}
      />

      <div
        className="w-full max-w-6xl px-3 sm:px-6 transition-transform duration-75 ease-out will-change-transform z-10"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity,
        }}
      >
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-white/[0.02] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
          <div className="relative rounded-[23px] overflow-hidden bg-[#06080d] aspect-[16/9] sm:aspect-[21/10] md:aspect-[2.35/1] max-h-[68vh] flex items-center justify-center">
            
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

      <div
        className="mt-4 sm:mt-6 flex flex-col items-center gap-2 cursor-pointer group transition-opacity duration-300 z-30"
        style={{ opacity: Math.max(0, 1 - progress * 2) }}
        onClick={() => {
          if (onScrollToStudio) onScrollToStudio();
          else window.scrollTo({ top: 650, behavior: "smooth" });
        }}
      >
        <span className="text-[11px] font-mono tracking-widest text-slate-400 group-hover:text-cyan-400 uppercase transition-colors">
          Scroll to direct lip sync studio
        </span>
        <div className="w-6 h-6 rounded-full border border-white/10 group-hover:border-cyan-400/40 bg-white/[0.02] flex items-center justify-center animate-bounce">
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
        </div>
      </div>
    </section>
  );
};
