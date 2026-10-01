import { CinemaRigConfig } from "./types";

export interface StylePreset {
  id: string;
  name: string;
  category: "cinema" | "photo" | "art" | "anime" | "surreal";
  iconName: string;
  promptSuffix: string;
  negativePrompt?: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "cyber-cinema",
    name: "Cyber Cinema",
    category: "cinema",
    iconName: "Film",
    promptSuffix: ", cinematic 8k neon illumination, anamorphic 35mm lens, atmospheric volumetric haze, Blade Runner aesthetic, ultra-detailed, chiaroscuro lighting",
    negativePrompt: "cartoon, flat, low quality, oversaturated, blurry",
  },
  {
    id: "photorealism",
    name: "Photorealism",
    category: "photo",
    iconName: "Camera",
    promptSuffix: ", raw candid photograph, Hasselblad H6D-100c, 80mm lens, f/2.8, natural directional window light, hyper-realistic skin texture, 32k resolution",
    negativePrompt: "airbrushed, plastic, 3d render, CGI, watermark, blurry",
  },
  {
    id: "analog-35mm",
    name: "Analog 35mm",
    category: "photo",
    iconName: "Sparkles",
    promptSuffix: ", shot on 35mm Kodak Portra 400 film, nostalgic color grading, subtle film grain, organic soft focus halation, authentic vintage aesthetic",
    negativePrompt: "digital, sharp digital artifacts, clean modern, sterile",
  },
  {
    id: "anime-master",
    name: "Anime Master",
    category: "anime",
    iconName: "Palette",
    promptSuffix: ", Makoto Shinkai aesthetic, Studio Ghibli vibrance, hand-painted keyframe, celestial clouds, dynamic lighting, masterpiece anime render",
    negativePrompt: "photorealistic, 3d render, noisy, low res",
  },
  {
    id: "surreal-3d",
    name: "Surreal 3D",
    category: "surreal",
    iconName: "Box",
    promptSuffix: ", surrealist 3D digital art, Octane Render 2026, iridescent glass refractions, ethereal floating geometry, Ray Tracing, ACEScg color pipeline",
    negativePrompt: "flat 2d, sketch, low contrast, monochrome",
  },
];

export function applyStylePreset(basePrompt: string, preset: StylePreset): string {
  const trimmed = basePrompt.trim();
  if (trimmed.includes(preset.promptSuffix)) return trimmed;
  return `${trimmed}${preset.promptSuffix}`;
}

export function compileCinemaPrompt(config: CinemaRigConfig): string {
  const { prompt, camera, lens, focalLength, aperture } = config;

  // Compute optical perspective characteristics
  let perspective = "natural organic human field of view";
  if (focalLength <= 14) {
    perspective = "ultra-wide dynamic distortion, expansive spatial grandeur";
  } else if (focalLength <= 28) {
    perspective = "wide angle environmental perspective, architectural depth";
  } else if (focalLength >= 70) {
    perspective = "compressed telephoto perspective, dramatic planar isolation";
  }

  // Compute depth of field and optical characteristics
  let depthEffect = "crisp balanced depth of field, sharp architectural detail";
  if (aperture.includes("1.4") || aperture.includes("1.8") || aperture.includes("2.8")) {
    depthEffect = "sublime cinematic bokeh, creamy shallow depth of field, creamy circular specular highlights";
  } else if (aperture.includes("8") || aperture.includes("11")) {
    depthEffect = "hyper-sharp deep focus geometry across all depth planes";
  }

  const cleanPrompt = prompt.trim() || "A cinematic scene";

  return `${cleanPrompt}, shot on a ${camera}, using a ${lens} at ${focalLength}mm (${perspective}), aperture ${aperture}, ${depthEffect}, volumetric chiaroscuro lighting, ACEScg 32-bit color pipeline, 2.39:1 aspect ratio, master cinema render`;
}
