"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, ChevronDown, Wand2, Eye, Compass, Layers, ShieldCheck, Zap } from "lucide-react";

interface CinematicImageHeroProps {
  imageSrc?: string;
  imageAlt?: string;
  onUsePrompt?: (promptText: string) => void;
  onScrollToStudio?: () => void;
}

export const CinematicImageHero: React.FC<CinematicImageHeroProps> = ({
  imageSrc = "/images/hero-neural-art.jpg",
  imageAlt = "Aether Neural Studio AI-generated artwork",
  onUsePrompt,
  onScrollToStudio,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    // Optimized scroll listener using requestAnimationFrame
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
    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Compute scroll transition factors (0 to 1 over first 450px)
  const maxScroll = 450;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

  // Cinematic scroll transforms
  const translateY = prefersReducedMotion ? 0 : progress * -140;
  const scale = prefersReducedMotion ? 1 : 1 - progress * 0.06;
  const opacity = prefersReducedMotion ? 1 : Math.max(0, 1 - progress * 1.15);
  const blur = prefersReducedMotion ? 0 : progress * 8;

  const samplePrompt = "A breathtaking cinematic futuristic digital artwork of an ethereal biomechanical luminescent sculpture dissolving into floating iridescent geometric crystals, glowing cyan and violet neural fiber ribbons, dark atmospheric void background, 8k luxury art";

  const handleScrollClick = () => {
    if (onScrollToStudio) {
      onScrollToStudio();
    } else {
      window.scrollTo({
        top: Math.min(window.innerHeight * 0.75, 600),
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-2 sm:pt-4 pb-8 select-none"
      style={{
        minHeight: "calc(82vh - 64px)",
      }}
    >
      {/* Background Ambient Glow Behind Hero Image */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl h-[450px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10 transition-opacity duration-300"
        style={{
          opacity: Math.max(0, 1 - progress * 1.3),
        }}
      />

      {/* Cinematic Hero Image Container (Stage 1 & Stage 2 Transition) */}
      <div
        className="w-full max-w-5xl px-3 sm:px-6 transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity,
          filter: blur > 0.5 ? `blur(${blur}px)` : "none",
          pointerEvents: opacity < 0.2 ? "none" : "auto",
        }}
      >
        {/* Frame / Matte Shell */}
        <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.18] via-white/[0.06] to-transparent shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden">
          
          {/* Subtle Ambient Radial Flash on Hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10 opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative rounded-[23px] overflow-hidden bg-[#0a0d14] aspect-[16/9] sm:aspect-[21/10] md:aspect-[2.2/1] max-h-[62vh] flex items-center justify-center">
            
            {/* The AI Artwork */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover object-center transform group-hover:scale-[1.015] transition-transform duration-1000 ease-out"
              loading="eager"
            />

            {/* Dark Cinematic Vignette & Bottom Depth Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/95 via-transparent to-[#050609]/25 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/30 via-transparent to-[#050609]/30 pointer-events-none" />

            {/* HUD / Latent Spec Overlay Top-Left */}
            <div className="absolute top-3 sm:top-5 left-3 sm:left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050609]/70 backdrop-blur-md border border-white/[0.1] shadow-lg">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-80" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-cyan" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-slate-200 uppercase">
                Neural Latent Synthesis // Flux.1
              </span>
            </div>

            {/* HUD / Fidelity Spec Overlay Top-Right */}
            <div className="hidden sm:flex absolute top-5 right-6 items-center gap-2 px-3 py-1.5 rounded-full bg-[#050609]/70 backdrop-blur-md border border-white/[0.1] shadow-lg">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 tracking-wider">
                16K Native Diffusion • 0.04s
              </span>
            </div>

            {/* Bottom Caption & Interactive "Use Prompt" Action */}
            <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="max-w-xl">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-cyan-400 mb-0.5">
                  <Wand2 className="w-3 h-3" />
                  <span>Prompt Archetype</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-sans font-normal line-clamp-1 drop-shadow-md">
                  &ldquo;Ethereal Biomechanical Synthesis // Latent Crystal Matrix&rdquo;
                </p>
              </div>

              {onUsePrompt && (
                <button
                  type="button"
                  onClick={() => onUsePrompt(samplePrompt)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-lg transition-all"
                  title="Load this prompt into the studio input"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Load Prompt</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Stage 1 Scroll Prompt Cue */}
      <div
        className="mt-4 sm:mt-6 flex flex-col items-center gap-2 cursor-pointer group transition-opacity duration-300"
        style={{
          opacity: Math.max(0, 1 - progress * 2),
          pointerEvents: progress > 0.4 ? "none" : "auto",
        }}
        onClick={handleScrollClick}
      >
        <span className="text-[11px] font-mono tracking-widest text-slate-400 group-hover:text-cyan-400 uppercase transition-colors flex items-center gap-1.5">
          <span>Scroll to direct neural studio</span>
        </span>
        <div className="w-6 h-6 rounded-full border border-white/10 group-hover:border-cyan-400/40 bg-white/[0.02] flex items-center justify-center transition-all animate-bounce">
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
        </div>
      </div>
    </div>
  );
};
