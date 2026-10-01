import { describe, it, expect } from "vitest";
import { MODEL_REGISTRY, T2I_MODELS, I2I_MODELS, T2V_MODELS, I2V_MODELS, LIPSYNC_MODELS, getModelById } from "@/lib/registry";

describe("model-registry", () => {
  it("contains models across all required studio categories", () => {
    expect(T2I_MODELS.length).toBeGreaterThanOrEqual(5);
    expect(I2I_MODELS.length).toBeGreaterThanOrEqual(4);
    expect(T2V_MODELS.length).toBeGreaterThanOrEqual(5);
    expect(I2V_MODELS.length).toBeGreaterThanOrEqual(4);
    expect(LIPSYNC_MODELS.length).toBeGreaterThanOrEqual(5);
  });

  it("verifies Nano Banana 2 Edit supports 14 reference images", () => {
    const nanoEdit = getModelById("nano-banana-2-edit");
    expect(nanoEdit).toBeDefined();
    expect(nanoEdit?.inputs.imageField).toBe("images_list");
    expect(nanoEdit?.inputs.maxImages).toBe(14);
    expect(nanoEdit?.inputs.promptOptional).toBe(true);
  });

  it("verifies Flux Dev has aspect ratio and resolution constraints", () => {
    const fluxDev = getModelById("flux-dev");
    expect(fluxDev).toBeDefined();
    expect(fluxDev?.inputs.aspect_ratio).toBe(true);
    expect(fluxDev?.inputs.supported_aspect_ratios).toContain("16:9");
    expect(fluxDev?.inputs.supported_resolutions).toContain("2K");
  });

  it("verifies Kling v2.1 video durations and qualities", () => {
    const kling = getModelById("kling-v2-1-t2v");
    expect(kling).toBeDefined();
    expect(kling?.inputs.supported_durations).toContain(5);
    expect(kling?.inputs.supported_durations).toContain(10);
    expect(kling?.inputs.supported_qualities).toContain("high");
  });
});
