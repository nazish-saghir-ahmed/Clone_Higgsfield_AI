"use client";

import React from "react";
import { UnifiedStudioStage } from "@/components/studio/UnifiedStudioStage";
import { T2V_MODELS, I2V_MODELS } from "@/lib/registry";

export default function VideoStudioPage() {
  const combinedVideoModels = [...T2V_MODELS, ...I2V_MODELS];

  return (
    <UnifiedStudioStage
      studioType="video"
      engineBadge="AETHER TEMPORAL ENGINE V3.4"
      headlineMain="Video Studio —"
      headlineEmphasis="motion,"
      headlineSuffix=" imagined."
      subtitle="Generate, extend, interpolate, and direct temporal diffusion with precise six-axis camera trajectories."
      placeholderText="Describe the video scene or camera trajectory... (e.g., Drone sweep over neon cyberpunk metropolis at dusk)"
      models={combinedVideoModels}
      defaultModelId="kling-v2-1-t2v"
    />
  );
}
