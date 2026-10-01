"use client";

import React from "react";
import { UnifiedStudioStage } from "@/components/studio/UnifiedStudioStage";
import { T2I_MODELS } from "@/lib/registry";

export default function CinemaStudioPage() {
  return (
    <UnifiedStudioStage
      studioType="cinema"
      engineBadge="AETHER VIRTUAL OPTICAL RIG V5.0"
      headlineMain="Cinema Studio —"
      headlineEmphasis="direct"
      headlineSuffix=" the impossible."
      subtitle="Direct 2.39:1 Hollywood compositions with four-wheel camera rigs, multi-shot storyboards, and volumetric lighting."
      placeholderText="Describe the core scene narrative and mood... (e.g., A lone detective standing under rain-slicked neon streetlights)"
      models={T2I_MODELS}
      defaultModelId="flux-dev"
    />
  );
}
