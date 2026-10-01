"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Sparkles, ChevronDown, ChevronLeft, ChevronRight, Wand2, Zap, Camera, Car, Building2 } from "lucide-react";

export interface ShowcaseSlide {
  id: string;
  category: string;
  badge: string;
  title: string;
  prompt: string;
  imageSrc: string;
  techSpecs: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: "portrait",
    category: "Editorial Fashion Portraiture",
    badge: "Photorealism Engine",
    title: "Editorial Fashion Portraiture // 85mm Studio Lighting",
    prompt: "Cinematic editorial fashion portrait of a stylish person in a dark luxury wool coat, dramatic side studio lighting with subtle cool cyan rim light, high contrast, deep shadows, dark moody background, shot on 35mm film, Hasselblad photorealism, ultra detailed skin texture",
    imageSrc: "/images/showcase-portrait.jpg",
    techSpecs: "Hasselblad 85mm f/1.2 • 16-Bit RAW",
    icon: Camera,
  },
  {
    id: "automotive",
    category: "Commercial Automotive",
    badge: "Commercial Precision",
    title: "Automotive Commercial // Wet Asphalt & Night Metropolis",
    prompt: "Cinematic commercial photography of a sleek matte black luxury concept supercar parked on wet reflective asphalt in a dark urban metropolis at night, dramatic atmospheric mist, glowing headlights, subtle cyan and amber street reflections in puddles, ultra photorealistic, 8k, shot on Arri Alexa",
    imageSrc: "/images/showcase-automotive.jpg",
    techSpecs: "Arri Alexa LF • Wet Asphalt Raytracing",
    icon: Car,
  },
  {
    id: "architecture",
    category: "Spatial & Architectural Design",
    badge: "Spatial Diffusion",
    title: "Modern Architectural Villa // Twilight Volumetric Lighting",
    prompt: "Architectural Digest editorial photography of an ultra-modern luxury minimalist concrete villa interior at twilight with floor-to-ceiling panoramic glass walls overlooking a dark mist forest, dramatic recessed warm lighting, sleek black designer furniture, reflections on polished dark stone floors, 8k photorealistic",
    imageSrc: "/images/showcase-architecture.jpg",
    techSpecs: "Architectural Digest • Volumetric Dusk GI",
    icon: Building2,
  },
];

interface CinematicImageHeroProps {
  onUsePrompt?: (promptText: string) => void;
  onScrollToStudio?: () => void;
}

export const CinematicImageHero: React.FC<CinematicImageHeroProps> = ({
  onUsePrompt,
  onScrollToStudio,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  }, []);

  // Keyboard navigation & Reduced Motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", handleKeyDown);

    // Scroll listener using requestAnimationFrame
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
      mediaQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [nextSlide, prevSlide]);

  // Auto-advance carousel every 6 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Handle Touch Swipes
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  // Scroll transition math (0 to 1 over first 450px)
  const maxScroll = 450;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

  const translateY = prefersReducedMotion ? 0 : progress * -120;
  const scale = prefersReducedMotion ? 1 : 1 - progress * 0.05;
  const opacity = prefersReducedMotion ? 1 : Math.max(0, 1 - progress * 1.15);
  const blur = prefersReducedMotion ? 0 : progress * 8;

  const activeSlideData = SHOWCASE_SLIDES[currentSlide];

  const handleScrollClick = () => {
    if (onScrollToStudio) {
      onScrollToStudio();
    } else {
      window.scrollTo({
        top: Math.min(window.innerHeight * 0.8, 650),
        behavior: "smooth",
      });
    }
  };

  const handleLoadCurrentPrompt = () => {
    if (onUsePrompt) {
      onUsePrompt(activeSlideData.prompt);
    }
  };

  return (
    <div
      className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-1 sm:pt-3 pb-8 select-none"
      style={{
        minHeight: "calc(88vh - 64px)",
      }}
    >
      {/* Dynamic Background Ambient Backlight */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[95vw] max-w-6xl h-[500px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10 transition-opacity duration-300"
        style={{
          opacity: Math.max(0, 1 - progress * 1.3),
        }}
      />

      {/* Expanded Hero Showcase Container (Stage 1 & Stage 2 Transition) */}
      <div
        className="w-full max-w-7xl px-2 sm:px-4 lg:px-6 transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity,
          filter: blur > 0.5 ? `blur(${blur}px)` : "none",
          pointerEvents: opacity < 0.2 ? "none" : "auto",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-bleed Cinematic Frame Shell */}
        <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-white/[0.02] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
          
          {/* Main Visual Slider Canvas */}
          <div className="relative rounded-[23px] overflow-hidden bg-[#06080d] aspect-[16/10] sm:aspect-[21/10] md:aspect-[2.35/1] max-h-[72vh] flex items-center justify-center">
            
            {/* Horizontal Slide Images */}
            <div
              className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {SHOWCASE_SLIDES.map((slide, idx) => (
                <div key={slide.id} className="w-full h-full flex-shrink-0 relative overflow-hidden bg-black">
                  <img
                    src={slide.imageSrc}
                    alt={slide.title}
                    className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
                      idx === currentSlide ? "scale-100" : "scale-105"
                    }`}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                  
                  {/* Cinematic Edge & Base Vignettes for High Contrast UI Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/95 via-transparent to-[#050609]/40 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/60 via-transparent to-[#050609]/60 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Top-Left Live HUD Badge */}
            <div className="absolute top-3 sm:top-5 left-3 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-80" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-cyan" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                <span>{activeSlideData.badge}</span>
                <span className="text-slate-500">/</span>
                <span className="text-accent-cyan">{activeSlideData.category}</span>
              </span>
            </div>

            {/* Top-Right Technical Specs Tag */}
            <div className="hidden sm:flex absolute top-5 right-6 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
              <Zap className="w-3 h-3 text-accent-cyan" />
              <span className="text-[11px] font-mono text-slate-300 tracking-wider">
                {activeSlideData.techSpecs}
              </span>
            </div>

            {/* Navigation Chevron Left */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous showcase visual"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Navigation Chevron Right */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next showcase visual"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Showcase Caption & Action Bar */}
            <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
              <div className="max-w-2xl bg-black/40 backdrop-blur-sm p-2 sm:p-3 rounded-2xl border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-cyan-400 mb-1">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Verified Prompt Archetype</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-sans font-normal line-clamp-2 leading-relaxed drop-shadow-md">
                  &ldquo;{activeSlideData.prompt}&rdquo;
                </p>
              </div>

              {/* Action Buttons & Slide Dots */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {onUsePrompt && (
                  <button
                    type="button"
                    onClick={handleLoadCurrentPrompt}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 active:scale-95 border border-cyan-400/40 backdrop-blur-md text-xs font-semibold text-white shadow-lg transition-all"
                    title="Load this verified prompt into the studio"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Try This Prompt</span>
                  </button>
                )}
              </div>
            </div>

            {/* Carousel Navigation Indicator Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              {SHOWCASE_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Jump to ${slide.category}`}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentSlide
                      ? "w-7 h-2 bg-gradient-to-r from-accent-cyan to-indigo-400 shadow-[0_0_8px_rgba(0,219,233,0.5)]"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Stage 1 Scroll Prompt Indicator */}
      <div
        className="mt-3 sm:mt-5 flex flex-col items-center gap-2 cursor-pointer group transition-opacity duration-300"
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
