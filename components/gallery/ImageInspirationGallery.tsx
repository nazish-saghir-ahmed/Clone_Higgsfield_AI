"use client";

import React from "react";
import { Sparkles, Wand2, ArrowUpRight, Layers, Eye } from "lucide-react";

interface InspirationItem {
  id: string;
  title: string;
  category: string;
  imageSrc: string;
  prompt: string;
  model: string;
}

const INSPIRATION_ITEMS: InspirationItem[] = [
  {
    id: "insp-1",
    title: "Editorial 85mm Fashion",
    category: "Fashion & Portraiture",
    imageSrc: "/images/showcase-portrait.jpg",
    prompt: "Cinematic editorial fashion portrait of a stylish person in a dark luxury wool coat, dramatic side studio lighting, 35mm film grain",
    model: "Flux Dev",
  },
  {
    id: "insp-2",
    title: "Matte Hypercar in Rain",
    category: "Automotive Commercial",
    imageSrc: "/images/showcase-automotive.jpg",
    prompt: "Cinematic commercial photography of a sleek matte black luxury concept supercar on wet reflective asphalt in nocturnal metropolis",
    model: "SDXL Turbo",
  },
  {
    id: "insp-3",
    title: "Modern Concrete Villa",
    category: "Spatial Architecture",
    imageSrc: "/images/showcase-architecture.jpg",
    prompt: "Architectural Digest photography of an ultra-modern luxury minimalist concrete villa at twilight, panoramic glass walls, mist forest reflections",
    model: "Midjourney v6 Neo",
  },
  {
    id: "insp-4",
    title: "Cyberpunk High-Speed Flow",
    category: "Motion Concept",
    imageSrc: "/images/showcase-video.jpg",
    prompt: "Cinematic high-speed motion sequence of a futuristic neon cyberpunk metropolis at night, glowing cyan light trails",
    model: "Kling 1.5 Pro",
  },
];

interface ImageInspirationGalleryProps {
  onSelectPrompt: (promptText: string) => void;
}

export const ImageInspirationGallery: React.FC<ImageInspirationGalleryProps> = ({
  onSelectPrompt,
}) => {
  return (
    <section className="w-full max-w-5xl mt-16 sm:mt-24 px-4 select-none animate-fadeIn">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent-cyan mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Latent Benchmarks</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Inspiration & Verified Archetypes
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Click any archetype to instantly synthesize in the studio
        </p>
      </div>

      {/* Grid Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INSPIRATION_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative rounded-2xl overflow-hidden bg-[#0a0d14] border border-white/[0.08] hover:border-accent-cyan/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg flex flex-col justify-between"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-[4/3] overflow-hidden bg-black">
              <img
                src={item.imageSrc}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent" />
              
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-accent-cyan">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase block mb-1">
                  {item.category}
                </span>
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors line-clamp-1 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 font-normal line-clamp-2 leading-relaxed">
                  &ldquo;{item.prompt}&rdquo;
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{item.model}</span>
                <span className="text-accent-cyan group-hover:underline">Load &rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
