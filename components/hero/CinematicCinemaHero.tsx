"use client";

import React from "react";
import { Clapperboard, Film, Sparkles, Zap } from "lucide-react";

interface CinematicCinemaHeroProps {
  onUsePrompt?: (promptText: string) => void;
}

export const CinematicCinemaHero: React.FC<CinematicCinemaHeroProps> = ({
  onUsePrompt,
}) => {
  const cinemaPrompt = "Ultra widescreen 2.39:1 anamorphic movie frame of an astronaut discovering a colossal obsidian alien structure in a misty desert at golden hour dusk, Panavision lens flare, 35mm grain";

  return (
    <section className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-6 pb-6 select-none animate-fadeIn">
      {/* Section Header */}
      <div className="w-full max-w-6xl px-4 sm:px-6 mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1.5">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Virtual Optical Rig Benchmarks</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Cinematic Directing & Anamorphic Optics
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          2.39:1 Widescreen composition & virtual lens simulation
        </p>
      </div>

      <div className="w-full max-w-6xl px-3 sm:px-6 z-10">
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.25] via-white/[0.08] to-white/[0.02] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
          {/* Anamorphic 2.39:1 Aspect Ratio Box */}
          <div className="relative rounded-[23px] overflow-hidden bg-[#06080d] aspect-[2.39/1] max-h-[65vh] flex items-center justify-center">
            
            <img
              src="/images/showcase-cinema.jpg"
              alt="Cinema Studio 2.39:1 Anamorphic Directing"
              className="w-full h-full object-cover object-center"
            />

            {/* Letterbox Bars and Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/95 via-transparent to-[#050609]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/60 via-transparent to-[#050609]/60 pointer-events-none" />

            {/* Top-Left Live HUD Badge */}
            <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-80" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-cyan" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-slate-200 uppercase">
                Anamorphic Lens Engine // 2.39:1 Widescreen
              </span>
            </div>

            {/* Top-Right Director Rig Specs */}
            <div className="hidden sm:flex absolute top-4 right-6 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <Film className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-mono text-slate-300">
                Panavision C-Series • Golden Hour Dusk GI
              </span>
            </div>

            {/* Bottom Caption & Director Action */}
            <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-slate-200 line-clamp-1 max-w-xl">
                &ldquo;{cinemaPrompt}&rdquo;
              </p>
              {onUsePrompt && (
                <button
                  type="button"
                  onClick={() => onUsePrompt(cinemaPrompt)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-xs font-semibold text-white whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Direct Scene</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
