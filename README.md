# Aether Neural Studio (Higgsfield AI Alternative)

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-green?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

> **Aether Neural Studio** is a high-performance, open-source AI creative workstation engineered for next-generation text-to-image, text-to-video, acoustic lip sync, and 4-wheel virtual camera cinematic directing.

---

## 🌟 Overview & Creative Suite Architecture

Aether Neural Studio provides creators, directors, and artists with a unified, dark futuristic generative workspace. Built with a clean-room architectural specification, it decouples the front-end user experience from neural model providers through an asynchronous submit-and-poll gateway, client-side BYOK (Bring Your Own Key) keyrings, and reactive WebGL/canvas physics.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             AETHER NEURAL STUDIO                            │
├─────────────────┬──────────────────┬──────────────────┬─────────────────────┤
│  IMAGE STUDIO   │   VIDEO STUDIO   │     LIP SYNC     │    CINEMA STUDIO    │
│  "Future of     │  "Motion,        │  "Give Every     │  "Direct the        │
│   Vision"       │   Imagined"      │   Frame a Voice" │   Impossible"       │
├─────────────────┼──────────────────┼──────────────────┼─────────────────────┤
│ • 14 Ref Slots  │ • Motion Brush   │ • Phoneme Sync   │ • 4-Wheel Cam Rig   │
│ • Aspect Ratios │ • Frame Scrubber │ • Waveform Viz   │ • Anamorphic Optics │
│ • Model Picker  │ • 6-Axis Vectors │ • Audio Dropzone │ • Storyboard Tracks │
└─────────────────┴──────────────────┴──────────────────┴─────────────────────┘
```

---

## 🚀 The 4 Specialized Creative Studios

### 1. 🖼️ Image Studio — *Future of Vision* (`/image`)
- **Generation-First Layout**: Top-aligned prompt composer with real-time speech dictation and reactive border glow physics.
- **Multi-Reference Conditioning**: Up to 14 image slots for multi-layer composition, style transfer, and character consistency.
- **Model Registry**: Out-of-the-box support for `Flux.1 Dev`, `SDXL Turbo`, `Midjourney v6 Neo`, and `SD 3.5 Large`.
- **Curated Inspiration Gallery**: Interactive benchmark archetypes (Editorial Fashion, Commercial Automotive, Spatial Architecture) with one-click prompt injection.

### 2. 🎬 Video Studio — *Motion, Imagined* (`/video`)
- **Text-to-Video & Image-to-Video**: Start-frame upload dropzone with prompt synthesis.
- **Interactive Motion Brush**: Canvas overlay tool to paint optical flow vectors and define selective motion dynamics.
- **Temporal Diffusion Controls**: Duration (5s, 10s, 15s), camera movement vectors (Pan, Orbit, Crane, Dolly Zoom), and motion intensity multipliers (0.5x to 2.5x).
- **Temporal Flow Engine**: Interactive video player with live frame scrubber and resolution selector.

### 3. 🎙️ Lip Sync Studio — *Give Every Frame a Voice* (`/lipsync`)
- **Acoustic Phoneme Synthesis**: Synchronizes natural facial micro-expressions with zero head-drift artifacts.
- **Dual-Asset Conditioning**: Separate dropzones for visual portrait/video targets and speech audio tracks (`.mp3`, `.wav`, voice dictation).
- **Real-Time Audio Waveform**: Dynamic audio visualizer overlay demonstrating frequency-to-phoneme alignment.
- **Viseme Engines**: Integration with `LivePortrait Pro`, `SadTalker Ultra`, and `Wav2Lip Plus`.

### 4. 🎥 Cinema Studio — *Direct the Impossible* (`/cinema`)
- **Hollywood 2.39:1 Anamorphic Directing**: Widescreen cinematic canvas with Panavision lens flares and film grain HUD.
- **4-Wheel Virtual Camera Rig**: Scroll-snapping 3D director controls for Pitch, Yaw, Roll, and Dolly.
- **Optical & Lighting Presets**: Anamorphic 35mm, 50mm Prime, 85mm Portrait lenses paired with Film Noir, Golden Hour, and Volumetric Mist lighting setups.
- **Multi-Shot Storyboard Timeline**: Visual sequence director track (Shot 01: Establishing, Shot 02: Tracking, Shot 03: Close-Up).

---

## 🎨 UI Design System & Interactive Highlights

- **Dark Futuristic Aesthetic**: Near-black background (`#050609`), deep charcoal surfaces, and cyan/teal/purple accent glows.
- **Custom `BorderGlow` Physics**: Mouse-proximity detection tracking cursor distances and rendering dynamic radial-gradient border highlights (`#c084fc`, `#f472b6`, `#38bdf8`).
- **Interactive Cursor Particles**: High-performance Three.js / Canvas particle physics system that reacts to cursor velocity.
- **Responsive Panoramic Showcases**: Multi-frame horizontal carousels with adjacent peeking visuals and smooth touch/swipe navigation.

---

## 🛠️ Tech Stack & Monorepo Structure

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack ready) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Glassmorphism Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Graphics & Particles** | [Three.js](https://threejs.org/) & HTML5 Canvas |
| **Testing** | [Vitest](https://vitest.dev/) (Unit & Integration tests) |
| **Type Safety** | TypeScript 5.6 (Strict mode enabled) |

### 📁 Directory Layout

```
├── app/
│   ├── layout.tsx                # Global layout shell, cursor particle canvas, modals
│   ├── page.tsx                  # Root landing page (renders Image Studio)
│   ├── image/page.tsx            # Image Studio route
│   ├── video/page.tsx            # Video Studio route
│   ├── lipsync/page.tsx          # Lip Sync Studio route
│   ├── cinema/page.tsx           # Cinema Studio route
│   └── globals.css               # Design tokens, fonts, and radial backdrop glows
├── components/
│   ├── auth/                     # BYOK Key management modals
│   ├── canvas/                   # CursorParticleCanvas & MotionBrushCanvas
│   ├── cinema/                   # FourWheelRig & StoryboardTimeline
│   ├── gallery/                  # ImageInspirationGallery
│   ├── hero/                     # Purpose-built Cinematic Studio Heroes & Carousels
│   ├── image/                    # ReferenceTray & slot pickers
│   ├── layout/                   # AppHeader & Navigation pills
│   ├── shared/                   # HistoryDrawer, LightboxModal, UploadDropzone
│   ├── studio/                   # UnifiedStudioStage (Universal studio container)
│   └── ui/                       # BorderGlow & atomic UI primitives
├── lib/
│   ├── api-client.ts             # Gateway client with exponential backoff polling
│   ├── model-registry.ts         # Neural model catalog & parameter constraints
│   ├── prompt-compiler.ts        # Style presets & cinema prompt compilation
│   ├── storage.ts                # LocalStorage history & session recovery
│   ├── types.ts                  # Shared TypeScript interfaces & contracts
│   └── url-normalizer.ts         # CDN & proxy media URL sanitizer
├── public/
│   └── images/                   # Photorealistic showcase media assets
└── tests/                        # Vitest test suites (100% passing)
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher (Node 20+ recommended)
- **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nazish-saghir-ahmed/Clone_Higgsfield_AI.git
   cd Clone_Higgsfield_AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run test suites:**
   ```bash
   npm test
   ```

5. **Create a production build:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Security & BYOK Architecture

Aether Neural Studio follows a zero-trust, client-side secret model:
- **Client-Side Keyring**: API tokens for generation providers (e.g. OpenAI, Stability, Fal, Replicate, Kling) are stored locally in the user's browser using encrypted LocalStorage.
- **No Intermediate Logging**: Direct cryptographic headers bypass central tracking servers.
- **Offline Mode**: Full local interface inspection, prompt compiling, and 3D camera staging work without active cloud connections.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for personal and commercial projects.
