"use client";

import React, { useState, useEffect } from "react";
import { Clapperboard, Film, Sparkles, ChevronDown, Zap, Compass, Sliders, Eye } from "lucide-react";

interface CinematicCinemaHeroProps {
  onUsePrompt?: (promptText: string) => void;
  onScrollToStudio?: () => void;
}

export const CinematicCinemaHero: React.FC<CinematicCinemaHeroProps> = ({
  onUsePrompt,
  onScrollToStudio,
}) => {
  const [scrollY, setScrollY] = useState(0);

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

  const maxScroll = 450;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
  const translateY = progress * -120;
  const scale = 1 - progress * 0.05;
  const opacity = Math.max(0, 1 - progress * 1.15);

  const cinemaPrompt = "Ultra widescreen 2.39:1 anamorphic movie frame of an astronaut discovering a colossal obsidian alien structure in a misty desert at golden hour dusk, Panavision lens flare, 35mm grain";

  return (
    <section className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-1 sm:pt-4 pb-12 select-none">
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-[98vw] max-w-7xl h-[550px] bg-gradient-to-b from-amber-500/10 via-cyan-600/10 to-transparent blur-3xl pointer-events-none -z-10"
        style={{ opacity: Math.max(0, 1 - progress * 1.3) }}
      />

      <div
        className="w-full max-w-6xl px-3 sm:px-6 transition-transform duration-75 ease-out will-change-transform z-10"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity,
        }}
      >
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

            {/* Storyboard Shot Overlay Badges */}
            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-6 flex-col gap-2 bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">Multi-Shot Rig</span>
              <div className="text-[11px] font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Shot 1: Establishing
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/20" /> Shot 2: Medium Pan
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/20" /> Shot 3: Close-up
              </div>
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

      <div
        className="mt-4 sm:mt-6 flex flex-col items-center gap-2 cursor-pointer group transition-opacity duration-300 z-30"
        style={{ opacity: Math.max(0, 1 - progress * 2) }}
        onClick={() => {
          if (onScrollToStudio) onScrollToStudio();
          else window.scrollTo({ top: 650, behavior: "smooth" });
        }}
      >
        <span className="text-[11px] font-mono tracking-widest text-slate-400 group-hover:text-cyan-400 uppercase transition-colors">
          Scroll to direct cinema studio
        </span>
        <div className="w-6 h-6 rounded-full border border-white/10 group-hover:border-cyan-400/40 bg-white/[0.02] flex items-center justify-center animate-bounce">
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
        </div>
      </div>
    </section>
  );
};
