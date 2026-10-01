"use client";

import React from "react";
import { UnifiedStudioStage } from "@/components/studio/UnifiedStudioStage";
import { LIPSYNC_MODELS } from "@/lib/registry";

export default function LipSyncStudioPage() {
  return (
    <UnifiedStudioStage
      studioType="lipsync"
      engineBadge="AETHER ACOUSTIC VISEME ENGINE V2.2"
      headlineMain="Lip Sync Studio —"
      headlineEmphasis="future"
      headlineSuffix=" of voice"
      subtitle="Animate portrait faces and re-dub cinema videos with natural phoneme-accurate speech synchronization."
      placeholderText="Select or upload your speech track (.mp3/.wav) and visual target below to synchronize speech..."
      models={LIPSYNC_MODELS}
      defaultModelId="infinite-talk-720p"
    />
  );
}
