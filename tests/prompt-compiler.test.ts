import { describe, it, expect } from "vitest";
import { compileCinemaPrompt, applyStylePreset, STYLE_PRESETS } from "@/lib/prompt-compiler";

describe("prompt-compiler", () => {
  it("applies style preset without duplicating suffix", () => {
    const cyberPreset = STYLE_PRESETS.find((p) => p.id === "cyber-cinema")!;
    const base = "A cyberpunk street market";
    const enhanced = applyStylePreset(base, cyberPreset);

    expect(enhanced).toContain("cinematic 8k neon illumination");
    expect(enhanced).toContain(base);

    // Should not duplicate if applied twice
    const doubleEnhanced = applyStylePreset(enhanced, cyberPreset);
    expect(doubleEnhanced).toBe(enhanced);
  });

  it("compiles cinema prompt with correct ACEScg volumetric tokens", () => {
    const prompt = compileCinemaPrompt({
      prompt: "A solitary wanderer in a desert",
      camera: "Full-Frame Cine Digital",
      lens: "Master Anamorphic 35mm",
      focalLength: 35,
      aperture: "f/1.4",
    });

    expect(prompt).toContain("A solitary wanderer in a desert");
    expect(prompt).toContain("shot on a Full-Frame Cine Digital");
    expect(prompt).toContain("using a Master Anamorphic 35mm at 35mm");
    expect(prompt).toContain("aperture f/1.4");
    expect(prompt).toContain("sublime cinematic bokeh");
    expect(prompt).toContain("ACEScg 32-bit color pipeline");
    expect(prompt).toContain("2.39:1 aspect ratio");
  });

  it("compiles wide angle perspective for focal lengths <= 14mm", () => {
    const prompt = compileCinemaPrompt({
      prompt: "Architectural dome interior",
      camera: "Grand Format 70mm Film",
      lens: "Large Format 65mm Glass",
      focalLength: 14,
      aperture: "f/11.0",
    });

    expect(prompt).toContain("ultra-wide dynamic distortion");
    expect(prompt).toContain("hyper-sharp deep focus");
  });
});
