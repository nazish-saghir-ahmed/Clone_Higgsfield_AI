# 04. UI Design System & WebGL Shader Specification

## Overview & Visual Philosophy
Aether Neural Studio features a futuristic, high-density **Obsidian Glassmorphism** design language optimized for high-end digital artists, VFX creators, and cinema directors. The interface combines dark neutral backgrounds with deep translucent layers, luminescent neon highlights, and hardware-accelerated WebGL ambient shaders.

---

## 1. Design Tokens & Color Matrix

```css
:root {
  /* Surface Foundations */
  --bg-base: #06070a;
  --bg-surface: #0f111a;
  --bg-surface-elevated: #161926;
  --bg-surface-glass: rgba(255, 255, 255, 0.035);
  
  /* Structural Borders */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-prominent: rgba(255, 255, 255, 0.14);
  --border-focus: #00dbe9;
  
  /* Chromatic Accents */
  --accent-cyan: #00dbe9;
  --accent-cyan-glow: rgba(0, 219, 233, 0.35);
  --accent-indigo: #6366f1;
  --accent-indigo-glow: rgba(99, 102, 241, 0.3);
  --accent-lime: #d9ff00;
  --accent-lime-glow: rgba(217, 255, 0, 0.25);
  --status-error: #ef4444;
  --status-warning: #f59e0b;
  --status-success: #10b981;

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-accent: #00dbe9;
}
```

---

## 2. Typography & Font Hierarchy

1. **Brand & Hero Titles**: `Syne` / `Orbitron` (Geometric futuristic sans)
   - Weight: `700 Bold` / `800 ExtraBold`
   - Usage: App Title, Studio Header badges, Cinema Mode overlays.
2. **Standard UI Controls & Labels**: `Inter` (Neo-grotesque interface sans)
   - Weights: `400 Regular`, `500 Medium`, `600 SemiBold`
   - Usage: Buttons, Form fields, Tooltips, Navigation tab bars.
3. **Telemetry & Technical Metadata**: `JetBrains Mono` (Monospaced coding font)
   - Weights: `400 Regular`, `500 Medium`
   - Usage: Latency metrics, coordinates, seeds, resolution tags, JSON inspectors.

---

## 3. Obsidian Glassmorphism Specifications

Every card and floating drawer in Aether Neural Studio uses a multi-layered composited glass effect:

```css
.glass-panel {
  background: rgba(15, 17, 26, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5);
  border-radius: 16px;
}

.glass-panel-glow {
  border-color: rgba(0, 219, 233, 0.3);
  box-shadow: 
    0 0 25px rgba(0, 219, 233, 0.15),
    0 20px 50px rgba(0, 0, 0, 0.7),
    inset 0 1px 1px rgba(0, 219, 233, 0.3);
}
```

---

## 4. Interactive WebGL Plasma Shader Math & Lifecycle

The background environment renders a full-viewport hardware-accelerated interactive plasma shader utilizing Three.js and custom GLSL fragment shaders.

### 4.1 Vertex Shader (`plasma.vert`)
```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
```

### 4.2 Fragment Shader (`plasma.frag`)
$$\text{Plasma}(x, y, t) = \sin(x \cdot 3.0 + t) + \cos(y \cdot 2.5 - t) + \sin((x + y) \cdot 2.0 + t \cdot 1.5)$$

```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  vec2 mouseOffset = (uMouse - 0.5) * 0.2;
  vec2 p = (st - 0.5) * 2.0 + mouseOffset;
  
  float t = uTime * 0.4;
  
  float v1 = sin(p.x * 2.5 + t);
  float v2 = sin(p.y * 3.0 - t * 0.8);
  float v3 = sin((p.x + p.y) * 2.0 + t * 1.2);
  float v4 = sin(length(p) * 4.0 - t * 1.5);
  
  float plasma = (v1 + v2 + v3 + v4) * 0.25;
  
  // Base Palette Interpolation: Deep Void (#06070a) -> Indigo (#6366f1) -> Cyan (#00dbe9)
  vec3 colorBase = vec3(0.024, 0.027, 0.039);
  vec3 colorIndigo = vec3(0.388, 0.400, 0.945);
  vec3 colorCyan = vec3(0.0, 0.859, 0.914);
  
  vec3 finalColor = mix(colorBase, colorIndigo, clamp(plasma * 0.4 + 0.1, 0.0, 1.0));
  finalColor = mix(finalColor, colorCyan, clamp(pow(plasma + 0.5, 3.0) * 0.15, 0.0, 1.0));
  
  // Radial vignette
  float vignette = 1.0 - smoothstep(0.4, 1.4, length(st - 0.5));
  finalColor *= vignette;

  gl_FragColor = vec4(finalColor * uIntensity, 1.0);
}
```

### 4.3 Mouse Coordinate Linear Interpolation (`lerp`)
To eliminate jitter and create a viscous fluid sensation, the cursor position is interpolated on every animation frame:
$$x_{\text{current}} = x_{\text{current}} + (x_{\text{target}} - x_{\text{current}}) \times \alpha \quad (\alpha = 0.05)$$
$$y_{\text{current}} = y_{\text{current}} + (y_{\text{target}} - y_{\text{current}}) \times \alpha \quad (\alpha = 0.05)$$

### 4.4 CPU Throttling & Visibility Lifecycle
When the user switches tabs or minimizes the window (`document.hidden === true`), the `requestAnimationFrame` loop pauses execution to conserve 100% of GPU/CPU rendering cycles.
