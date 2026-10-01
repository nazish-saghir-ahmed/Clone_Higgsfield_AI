"use client";

import React, { useState } from "react";
import { Camera, Eye, Focus, Aperture, Sparkles, Copy, Check } from "lucide-react";
import { compileCinemaPrompt } from "@/lib/prompt-compiler";
import { CinemaRigConfig } from "@/lib/types";

interface FourWheelRigProps {
  basePrompt: string;
  onCompiledPromptChange: (compiledPrompt: string) => void;
}

const CAMERAS = [
  "Modular 8K Digital",
  "Full-Frame Cine Digital",
  "Grand Format 70mm Film",
  "Studio Digital S35",
  "Classic 16mm Film",
];

const LENSES = [
  "Master Anamorphic 35mm",
  "Cine Prime 40mm",
  "Large Format 65mm Glass",
  "Ultra Vista 70mm",
  "Halation Diffusion 50mm",
  "Tilt-Shift Architectural Lens",
];

const FOCAL_LENGTHS = [8, 14, 24, 35, 50, 85];

const APERTURES = ["f/1.4", "f/2.8", "f/4.0", "f/8.0", "f/11.0"];

export const FourWheelRig: React.FC<FourWheelRigProps> = ({
  basePrompt,
  onCompiledPromptChange,
}) => {
  const [selectedCamera, setSelectedCamera] = useState(CAMERAS[1]); // Full-Frame Cine Digital
  const [selectedLens, setSelectedLens] = useState(LENSES[0]); // Master Anamorphic 35mm
  const [selectedFocal, setSelectedFocal] = useState(FOCAL_LENGTHS[3]); // 35mm
  const [selectedAperture, setSelectedAperture] = useState(APERTURES[0]); // f/1.4
  const [copied, setCopied] = useState(false);

  const rigConfig: CinemaRigConfig = {
    prompt: basePrompt,
    camera: selectedCamera,
    lens: selectedLens,
    focalLength: selectedFocal,
    aperture: selectedAperture,
  };

  const compiledPrompt = compileCinemaPrompt(rigConfig);

  // Notify parent on change
  React.useEffect(() => {
    onCompiledPromptChange(compiledPrompt);
  }, [basePrompt, selectedCamera, selectedLens, selectedFocal, selectedAperture]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 4 Optical Carousel Wheels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-2xl bg-black/40 border border-white/10 shadow-xl backdrop-blur-md">
        {/* Wheel 1: Camera Body */}
        <div className="flex flex-col space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-accent-cyan" /> Camera Body
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {CAMERAS.map((cam) => (
              <button
                key={cam}
                type="button"
                onClick={() => setSelectedCamera(cam)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCamera === cam
                    ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {cam}
              </button>
            ))}
          </div>
        </div>

        {/* Wheel 2: Lens Glass */}
        <div className="flex flex-col space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-accent-indigo" /> Lens Glass
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {LENSES.map((lens) => (
              <button
                key={lens}
                type="button"
                onClick={() => setSelectedLens(lens)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all truncate ${
                  selectedLens === lens
                    ? "bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/40 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
                title={lens}
              >
                {lens}
              </button>
            ))}
          </div>
        </div>

        {/* Wheel 3: Focal Length */}
        <div className="flex flex-col space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Focus className="w-3.5 h-3.5 text-accent-lime" /> Focal Length
          </label>
          <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {FOCAL_LENGTHS.map((focal) => (
              <button
                key={focal}
                type="button"
                onClick={() => setSelectedFocal(focal)}
                className={`px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-all text-center ${
                  selectedFocal === focal
                    ? "bg-accent-lime/20 text-accent-lime border border-accent-lime/40 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {focal}mm
              </button>
            ))}
          </div>
        </div>

        {/* Wheel 4: Aperture */}
        <div className="flex flex-col space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Aperture className="w-3.5 h-3.5 text-rose-400" /> Aperture
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {APERTURES.map((ap) => (
              <button
                key={ap}
                type="button"
                onClick={() => setSelectedAperture(ap)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedAperture === ap
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {ap} {ap === "f/1.4" ? "(Ultra Bokeh)" : ap === "f/11.0" ? "(Deep Focus)" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Cinematography Compiler Preview Banner */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold text-accent-cyan flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> ACEScg Cinematography Token Stream
          </span>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy Token"}</span>
          </button>
        </div>
        <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5 select-all">
          {compiledPrompt}
        </p>
      </div>
    </div>
  );
};
