"use client";

import React from "react";
import { UnifiedStudioStage } from "@/components/studio/UnifiedStudioStage";
import { LIPSYNC_MODELS } from "@/lib/registry";

export default function LipSyncStudioPage() {
  return (
    <UnifiedStudioStage
      studioType="lipsync"
      engineBadge="AETHER ACOUSTIC VISEME ENGINE V2.2"
      headlineMain="Lip Sync —"
      headlineEmphasis="give every frame"
      headlineSuffix=" a voice."
      subtitle="Synchronize hyper-realistic facial phonemes and dynamic micro-expressions with zero head-drift artifacts."
      placeholderText="Select or upload your speech track (.mp3/.wav) and visual target below to synchronize speech..."
      models={LIPSYNC_MODELS}
      defaultModelId="infinite-talk-720p"
    />
  );
}
