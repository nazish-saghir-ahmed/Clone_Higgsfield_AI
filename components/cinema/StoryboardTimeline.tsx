"use client";

import React, { useState } from "react";
import { Film, Clapperboard, Plus, Play, Trash2, Camera } from "lucide-react";

export interface StoryboardShot {
  id: string;
  shotNumber: number;
  label: string;
  type: string;
  lens: string;
  lighting: string;
  duration: string;
}

const DEFAULT_SHOTS: StoryboardShot[] = [
  {
    id: "shot-1",
    shotNumber: 1,
    label: "Establishing Monolith Discovery",
    type: "Wide Drone Establishing",
    lens: "Anamorphic 35mm",
    lighting: "Golden Hour Dusk",
    duration: "4.5s",
  },
  {
    id: "shot-2",
    shotNumber: 2,
    label: "Astronaut Approach Track",
    type: "Low-Angle Tracking Dolly",
    lens: "50mm Prime",
    lighting: "Volumetric Mist",
    duration: "3.2s",
  },
  {
    id: "shot-3",
    shotNumber: 3,
    label: "Obsidian Glyphs Close-Up",
    type: "Macro Orbit Focus",
    lens: "85mm Portrait",
    lighting: "Cyan Glow Fill",
    duration: "5.0s",
  },
];

interface StoryboardTimelineProps {
  onSelectShot?: (shot: StoryboardShot) => void;
}

export const StoryboardTimeline: React.FC<StoryboardTimelineProps> = ({
  onSelectShot,
}) => {
  const [activeShotId, setActiveShotId] = useState<string>("shot-1");
  const [shots, setShots] = useState<StoryboardShot[]>(DEFAULT_SHOTS);

  return (
    <div className="w-full max-w-3xl mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-medium text-white uppercase tracking-wider">
            Multi-Shot Storyboard Timeline
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Total Sequence: 12.7s • 3 Shots
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {shots.map((shot) => {
          const isSelected = shot.id === activeShotId;
          return (
            <div
              key={shot.id}
              onClick={() => {
                setActiveShotId(shot.id);
                if (onSelectShot) onSelectShot(shot);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-500/10 border-amber-400/40 shadow-lg"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/50 text-amber-300 border border-amber-400/20">
                  Shot 0{shot.shotNumber}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {shot.duration}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                {shot.label}
              </h4>

              <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                <p className="truncate text-cyan-300">📹 {shot.type}</p>
                <p className="truncate text-slate-400">🔍 {shot.lens}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
