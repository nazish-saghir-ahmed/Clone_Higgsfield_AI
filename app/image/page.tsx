"use client";

import React from "react";
import { UnifiedStudioStage } from "@/components/studio/UnifiedStudioStage";
import { T2I_MODELS, I2I_MODELS } from "@/lib/registry";

export default function ImageStudioPage() {
  const combinedImageModels = [...T2I_MODELS, ...I2I_MODELS];

  return (
    <UnifiedStudioStage
      studioType="image"
      engineBadge="AETHER SPATIAL SYNTHESIS V4.7"
      headlineMain="Image Studio —"
      headlineEmphasis="future"
      headlineSuffix=" of vision"
      subtitle="Synthesize, composite, and direct multi-layer neural imagery with up to 14 reference conditioning slots."
      placeholderText="Describe the image you want to create... (e.g., An astronaut in iridescent crystal suit standing on glass alien dunes at twilight)"
      models={combinedImageModels}
      defaultModelId="flux-dev"
    />
  );
}
