# 03. Model Registry Schemas & Inference Matrix

## Overview & Architecture
The Model Registry acts as the single source of truth for all neural models supported by Aether Neural Studio. Each model is encapsulated in a formal TypeScript schema definition that specifies its unique routing endpoint, input constraints, image slot limits, and UI control flags.

---

## 1. Unified Model Schema Definition

```typescript
export type StudioCategory = 
  | "t2i" 
  | "i2i" 
  | "t2v" 
  | "i2v" 
  | "lipsync" 
  | "cinema" 
  | "utility";

export interface ModelInputConstraints {
  prompt: boolean;
  promptOptional?: boolean;
  negative_prompt?: boolean;
  aspect_ratio?: boolean;
  supported_aspect_ratios?: Array<"16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9">;
  resolution?: boolean;
  supported_resolutions?: Array<"480p" | "720p" | "1080p" | "1K" | "2K" | "4K">;
  quality?: boolean;
  supported_qualities?: Array<"basic" | "high" | "extreme">;
  duration?: boolean;
  supported_durations?: Array<5 | 10 | 15>;
  mode?: boolean;
  supported_modes?: Array<"normal" | "fun" | "spicy">;
  
  // Image reference fields
  imageField?: "image_url" | "images_list" | "source_image" | "input_image";
  maxImages?: number; // e.g., 1, 10, or 14 slots
  
  // Audio reference fields
  audioField?: "audio_url" | "audio_file";
  videoField?: "video_url" | "source_video";
}

export interface NeuralModelDefinition {
  id: string;
  name: string;
  developer: string;
  endpoint: string;
  category: StudioCategory;
  description: string;
  badge?: "PRO" | "FAST" | "HD" | "NEW" | "EXPERIMENTAL";
  inputs: ModelInputConstraints;
  defaultParams?: Record<string, any>;
}
```

---

## 2. Text-to-Image (T2I) Model Matrix

| Model ID | Public Name | Gateway Endpoint | Aspect Ratios | Resolutions | Badge |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `flux-dev` | Flux Dev | `/flux-dev` | 16:9, 9:16, 1:1, 4:3, 3:4, 21:9 | 1K, 2K | `PRO` |
| `flux-schnell` | Flux Schnell | `/flux-schnell` | 16:9, 9:16, 1:1, 4:3, 3:4 | 1K | `FAST` |
| `nano-banana` | Nano Banana | `/nano-banana` | 16:9, 9:16, 1:1 | 1K | `FAST` |
| `nano-banana-2` | Nano Banana 2 | `/nano-banana-2` | 16:9, 9:16, 1:1, 21:9 | 1K, 2K, 4K | `HD` |
| `seedream-5-0` | Seedream 5.0 | `/seedream-5-0` | 16:9, 9:16, 1:1, 4:3 | 2K, 4K | `NEW` |
| `ideogram-v3` | Ideogram v3 (Typography) | `/ideogram-v3` | 16:9, 9:16, 1:1, 3:4 | 1K, 2K | `PRO` |
| `midjourney-v7` | Midjourney v7 Render | `/midjourney-v7` | 16:9, 9:16, 1:1, 21:9 | 2K, 4K | `PRO` |

---

## 3. Image-to-Image (I2I) Multi-Reference Matrix

| Model ID | Public Name | Gateway Endpoint | Image Field | Max Slots | Prompt Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `nano-banana-2-edit` | Nano Banana 2 Edit | `/nano-banana-2-edit` | `images_list` | **14** | Optional guidance |
| `flux-kontext-dev` | Flux Kontext Dev | `/flux-kontext-dev` | `images_list` | **10** | Style & Subject blend |
| `gpt4o-edit` | GPT-4o Vision Edit | `/gpt4o-edit` | `images_list` | **10** | Multimodal instruction |
| `seedream-5-0-edit` | Seedream 5.0 Edit | `/seedream-5-0-edit` | `images_list` | **10** | Compositional transfer |
| `neural-upscaler-4k` | Clarity Neural Upscaler | `/upscale-4k` | `image_url` | 1 | Resolution factor (2x/4x) |
| `bg-remover-matting` | AI Alpha Matting | `/bg-remove` | `image_url` | 1 | Transparent alpha channel |

---

## 4. Text-to-Video (T2V) Motion Matrix

| Model ID | Public Name | Gateway Endpoint | Durations | Quality/Modes | Aspect Ratios |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `kling-v2-1-t2v` | Kling v2.1 Cinematic | `/kling-v2-1-t2v` | 5s, 10s | high, extreme | 16:9, 9:16, 1:1 |
| `kling-v1-6-t2v` | Kling v1.6 Fast | `/kling-v1-6-t2v` | 5s | basic, high | 16:9, 9:16 |
| `sora-2-t2v` | OpenAI Sora 2 | `/sora-2-t2v` | 5s, 10s, 15s | high | 16:9, 9:16, 21:9 |
| `veo-3-t2v` | Google DeepMind Veo 3 | `/veo-3-t2v` | 5s, 10s | high, extreme | 16:9, 9:16 |
| `wan-2-6-t2v` | Wan 2.6 Ultra Video | `/wan-2-6-t2v` | 5s, 10s | high | 16:9, 9:16, 1:1 |
| `seedance-2-0-t2v` | Seedance 2.0 | `/seedance-2-0-t2v` | 5s, 10s, 15s | basic, high | 16:9, 9:16 |
| `grok-imagine-t2v` | Grok Imagine Motion | `/grok-imagine-t2v` | 5s | normal, fun, spicy | 16:9, 9:16 |

---

## 5. Image-to-Video (I2V) & Motion Vector Matrix

| Model ID | Public Name | Gateway Endpoint | Image Input | Motion Vectors | Durations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `kling-i2v` | Kling I2V Engine | `/kling-i2v` | `image_url` | Motion Brush paths | 5s, 10s |
| `veo-3-i2v` | Veo 3 Image Animator | `/veo-3-i2v` | `image_url` | Physics camera flow | 5s, 10s |
| `runway-gen3-i2v` | Runway Gen-3 Alpha I2V | `/runway-gen3-i2v` | `image_url` | Trajectory arrows | 5s, 10s |
| `wan-2-2-i2v` | Wan 2.2 I2V Motion | `/wan-2-2-i2v` | `image_url` | Flow fields | 5s |
| `seedance-2-0-i2v` | Seedance 2.0 I2V | `/seedance-2-0-i2v` | `image_url` | Velocity curves | 5s, 10s |

---

## 6. Lip Sync & Speech Synthesis Matrix

| Model ID | Public Name | Gateway Endpoint | Source Type | Supported Resolutions | Max Audio Length |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `infinite-talk-480p` | Infinite Talk Standard | `/infinite-talk-480p` | Portrait Image + Audio | 480p | 120s |
| `infinite-talk-720p` | Infinite Talk HD | `/infinite-talk-720p` | Portrait Image + Audio | 720p | 90s |
| `infinite-talk-v2v` | Infinite Talk Video Sync | `/infinite-talk-v2v` | Source MP4 + Audio | 720p, 1080p | 60s |
| `wan-2-2-speech` | Wan 2.2 Neural Speech | `/wan-2-2-speech` | Portrait Image + Audio | 720p | 60s |
| `ltx-2-3-lipsync` | LTX 2.3 Expressive LipSync | `/ltx-2-3-lipsync` | Portrait Image + Audio | 480p, 720p, 1080p | 180s |
| `latentsync-pro` | LatentSync High Precision | `/latentsync-pro` | Source MP4 + Audio | 720p, 1080p | 60s |
| `creatify-neural` | Creatify Avatar Voice | `/creatify-neural` | Portrait Image + Audio | 720p | 120s |
| `veed-dub-sync` | Veed Studio Dubber | `/veed-dub-sync` | Source MP4 + Audio | 1080p | 180s |
