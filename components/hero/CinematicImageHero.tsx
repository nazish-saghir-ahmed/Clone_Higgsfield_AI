"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Sparkles, ChevronDown, ChevronLeft, ChevronRight, Wand2, Zap, Camera, Car, Building2, ArrowRight } from "lucide-react";

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

export const SHOWCASE_SLIDES: ShowcaseSlide[] = [
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

  // Auto-advance carousel every 7 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
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
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  // Scroll transition math (0 to 1 over first 450px)
  const maxScroll = 450;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

  const translateY = prefersReducedMotion ? 0 : progress * -130;
  const scale = prefersReducedMotion ? 1 : 1 - progress * 0.05;
  const opacity = prefersReducedMotion ? 1 : Math.max(0, 1 - progress * 1.15);
  const blur = prefersReducedMotion ? 0 : progress * 8;

  const activeSlideData = SHOWCASE_SLIDES[currentSlide];

  const handleScrollClick = () => {
    if (onScrollToStudio) {
      onScrollToStudio();
    } else {
      window.scrollTo({
        top: Math.min(window.innerHeight * 0.85, 680),
        behavior: "smooth",
      });
    }
  };

  const handleLoadCurrentPrompt = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onUsePrompt) {
      onUsePrompt(activeSlideData.prompt);
    }
  };

  return (
    <section
      className="relative w-full flex flex-col items-center justify-start overflow-hidden pt-1 sm:pt-4 pb-12 select-none"
      style={{
        minHeight: "calc(88vh - 64px)",
      }}
    >
      {/* 1. Global Ambient Gradient Atmospheres */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-[98vw] max-w-7xl h-[550px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10 transition-opacity duration-300"
        style={{
          opacity: Math.max(0, 1 - progress * 1.3),
        }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-[400px] h-[350px] bg-cyan-500/[0.07] blur-[120px] rounded-full pointer-events-none -z-10"
        style={{
          opacity: Math.max(0, 1 - progress * 1.3),
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[350px] bg-purple-600/[0.07] blur-[120px] rounded-full pointer-events-none -z-10"
        style={{
          opacity: Math.max(0, 1 - progress * 1.3),
        }}
      />

      {/* 2. Side Edge Soft Vignettes to Seamlessly Blend Peeking Slides */}
      <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#050609] via-[#050609]/70 to-transparent pointer-events-none z-20" />
      <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-40 bg-gradient-to-l from-[#050609] via-[#050609]/80 to-transparent pointer-events-none z-20" />

      {/* 3. Bottom Atmospheric Gradient Bleed merging Hero into the Page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050609] via-[#050609]/70 to-transparent pointer-events-none z-20" />

      {/* 4. Ultra-Wide Panoramic Multi-Frame Showcase Track */}
      <div
        className="w-full relative transition-transform duration-75 ease-out will-change-transform z-10"
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
        {/* Continuous Panoramic Track */}
        <div
          className="flex items-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] px-4 sm:px-8"
          style={{
            transform: `translateX(calc(50vw - (min(76vw, 1020px) / 2) - ${currentSlide} * (min(76vw, 1020px) + 24px)))`,
          }}
        >
          {SHOWCASE_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const isNext = idx === (currentSlide + 1) % SHOWCASE_SLIDES.length;
            const isPrev = idx === (currentSlide - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length;

            return (
              <div
                key={slide.id}
                onClick={() => {
                  if (!isActive) setCurrentSlide(idx);
                }}
                className={`flex-shrink-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? "cursor-default" : "cursor-pointer hover:opacity-85"
                }`}
                style={{
                  width: "min(76vw, 1020px)",
                  marginRight: "24px",
                  opacity: isActive ? 1 : 0.45,
                  transform: isActive ? "scale(1)" : "scale(0.96)",
                  filter: isActive ? "none" : "saturate(0.85) brightness(0.7)",
                }}
              >
                {/* Visual Card Frame */}
                <div
                  className={`relative rounded-3xl p-[1px] transition-all duration-500 overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-b from-white/[0.25] via-white/[0.08] to-white/[0.02] shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
                      : "bg-white/[0.04] shadow-lg border border-white/[0.04]"
                  }`}
                >
                  {/* Active Highlight Radial Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-indigo-500/10 opacity-70 pointer-events-none" />
                  )}

                  <div className="relative rounded-[23px] overflow-hidden bg-[#06080d] aspect-[16/10] sm:aspect-[21/10] md:aspect-[2.25/1] max-h-[70vh] flex items-center justify-center">
                    {/* The Visual Artwork */}
                    <img
                      src={slide.imageSrc}
                      alt={slide.title}
                      className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
                        isActive ? "scale-100" : "scale-105"
                      }`}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />

                    {/* Dark Cinematic Vignettes for Optimal Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/95 via-transparent to-[#050609]/35 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/65 via-transparent to-[#050609]/65 pointer-events-none" />

                    {/* Active HUD Overlays */}
                    {isActive && (
                      <>
                        {/* Top-Left Live HUD Badge */}
                        <div className="absolute top-3 sm:top-5 left-3 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
                          <span className="relative flex w-2 h-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-80" />
                            <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-cyan" />
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                            <span>{slide.badge}</span>
                            <span className="text-slate-500">/</span>
                            <span className="text-accent-cyan">{slide.category}</span>
                          </span>
                        </div>

                        {/* Top-Right Technical Specs Tag */}
                        <div className="hidden sm:flex absolute top-5 right-6 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050609]/80 backdrop-blur-md border border-white/[0.12] shadow-xl">
                          <Zap className="w-3 h-3 text-accent-cyan" />
                          <span className="text-[11px] font-mono text-slate-300 tracking-wider">
                            {slide.techSpecs}
                          </span>
                        </div>

                        {/* Navigation Chevron Left */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                          }}
                          aria-label="Previous visual"
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 backdrop-blur-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Navigation Chevron Right */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextSlide();
                          }}
                          aria-label="Next visual"
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 backdrop-blur-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Bottom Caption & Prompt Trigger */}
                        <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                          <div className="max-w-2xl bg-black/40 backdrop-blur-sm p-2.5 sm:p-3.5 rounded-2xl border border-white/[0.06]">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-cyan-400 mb-1">
                              <Wand2 className="w-3.5 h-3.5" />
                              <span>Verified Prompt Archetype</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 font-sans font-normal line-clamp-2 leading-relaxed drop-shadow-md">
                              &ldquo;{slide.prompt}&rdquo;
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            {onUsePrompt && (
                              <button
                                type="button"
                                onClick={handleLoadCurrentPrompt}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 active:scale-95 border border-cyan-400/40 backdrop-blur-md text-xs font-semibold text-white shadow-lg transition-all"
                                title="Load this prompt into the studio input"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                                <span>Try This Prompt</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Inactive Peeking Slide Teaser Tag */}
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-transparent transition-colors">
                        <div className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-xl">
                          <span>{slide.category}</span>
                          <ArrowRight className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Progress Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {SHOWCASE_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Jump to ${slide.category}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? "w-8 h-2 bg-gradient-to-r from-accent-cyan to-indigo-400 shadow-[0_0_8px_rgba(0,219,233,0.5)]"
                  : "w-2.5 h-2.5 bg-white/20 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 5. Stage 1 Scroll Prompt Indicator */}
      <div
        className="mt-4 sm:mt-6 flex flex-col items-center gap-2 cursor-pointer group transition-opacity duration-300 z-30"
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
    </section>
  );
};
