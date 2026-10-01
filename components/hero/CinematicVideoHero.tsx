"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, Zap, Film, Compass, Wand2, Sparkles, ChevronDown, Video, Sliders } from "lucide-react";

interface CinematicVideoHeroProps {
  onUsePrompt?: (promptText: string) => void;
  onScrollToStudio?: () => void;
}

export const CinematicVideoHero: React.FC<CinematicVideoHeroProps> = ({
  onUsePrompt,
  onScrollToStudio,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playProgress, setPlayProgress] = useState(35);
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

  // Timeline playback simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const maxScroll = 450;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
  const translateY = progress * -120;
  const scale = 1 - progress * 0.05;
  const opacity = Math.max(0, 1 - progress * 1.15);

  const videoPrompt = "Cinematic high-speed motion sequence of a futuristic neon cyberpunk metropolis at night, wet reflective streets with glowing cyan light trails, cinematic motion blur, anamorphic blue lens flare, Arri Alexa LF 8k";

  return (
    <section className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-1 sm:pt-4 pb-12 select-none">
      {/* Background Ambient Glow */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-[98vw] max-w-7xl h-[550px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10"
        style={{ opacity: Math.max(0, 1 - progress * 1.3) }}
      />

      {/* Hero Showcase Container */}
      <div
        className="w-full max-w-6xl px-3 sm:px-6 transition-transform duration-75 ease-out will-change-transform z-10"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity,
        }}
      >
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-white/[0.02] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
          <div className="relative rounded-[23px] overflow-hidden bg-[#06080d] aspect-[16/9] sm:aspect-[21/10] md:aspect-[2.35/1] max-h-[68vh] flex items-center justify-center">
            
            {/* Cinematic Motion Image */}
            <img
              src="/images/showcase-video.jpg"
              alt="Video Studio Motion Sequence"
              className="w-full h-full object-cover object-center"
            />

            {/* Dark Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/95 via-transparent to-[#050609]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/60 via-transparent to-[#050609]/60 pointer-events-none" />

            {/* Top-Left Live HUD Badge */}
            <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-80" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-cyan" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-slate-200 uppercase">
                Temporal Flow Engine // 60 FPS
              </span>
            </div>

            {/* Top-Right Resolution Tag */}
            <div className="hidden sm:flex absolute top-4 right-6 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] font-mono text-slate-300">
                1080p Target • 24 FPS Cinema • 15s
              </span>
            </div>

            {/* Center Play/Pause Trigger */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-2xl z-20 group"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-accent-cyan" />
              ) : (
                <Play className="w-6 h-6 text-accent-cyan translate-x-0.5" />
              )}
            </button>

            {/* Bottom Scrubber & Prompt Action */}
            <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 flex flex-col gap-2">
              {/* Timeline Scrubber */}
              <div className="w-full bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center gap-3">
                <span className="text-[10px] font-mono text-cyan-400">00:0{Math.floor(playProgress / 20)}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-accent-cyan via-indigo-500 to-pink-500 rounded-full transition-all duration-100"
                    style={{ width: `${playProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">00:05</span>
              </div>

              {/* Caption & Use Prompt */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-1">
                <p className="text-xs text-slate-200 line-clamp-1">
                  &ldquo;{videoPrompt}&rdquo;
                </p>
                {onUsePrompt && (
                  <button
                    type="button"
                    onClick={() => onUsePrompt(videoPrompt)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-xs font-semibold text-white whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Try This Prompt</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll Down Cue */}
      <div
        className="mt-4 sm:mt-6 flex flex-col items-center gap-2 cursor-pointer group transition-opacity duration-300 z-30"
        style={{
          opacity: Math.max(0, 1 - progress * 2),
        }}
        onClick={() => {
          if (onScrollToStudio) onScrollToStudio();
          else window.scrollTo({ top: 650, behavior: "smooth" });
        }}
      >
        <span className="text-[11px] font-mono tracking-widest text-slate-400 group-hover:text-cyan-400 uppercase transition-colors">
          Scroll to direct video studio
        </span>
        <div className="w-6 h-6 rounded-full border border-white/10 group-hover:border-cyan-400/40 bg-white/[0.02] flex items-center justify-center animate-bounce">
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
        </div>
      </div>
    </section>
  );
};
