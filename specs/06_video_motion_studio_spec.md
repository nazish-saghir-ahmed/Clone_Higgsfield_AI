# 06. Video & Motion Studio Specification (T2V, I2V, Motion Brush)

## Overview & Architecture
The Video & Motion Studio enables high-fidelity temporal synthesis through **Text-to-Video (T2V)** and **Image-to-Video (I2V)** models, featuring an integrated **Motion Brush Vector Canvas** for localized trajectory control.

---

## 1. Dual-Mode Video Synthesis Engine

### 1.1 State Transitions
- **T2V Mode (Text Conditioning Only)**:
  - Trigger: Start-frame input is empty.
  - Active Registry: `kling-v2-1-t2v`, `sora-2-t2v`, `veo-3-t2v`, `wan-2-6-t2v`, `grok-imagine-t2v`.
  - Prompt: Mandatory descriptive text describing subject action and camera motion.
- **I2V Mode (Image-Conditioned Motion)**:
  - Trigger: Start-frame image uploaded / selected.
  - Active Registry: `kling-i2v`, `veo-3-i2v`, `runway-gen3-i2v`, `wan-2-2-i2v`.
  - Motion Brush: Enabled over the uploaded start-frame canvas.

---

## 2. Motion Parameter Matrix

| Parameter | Options | Default | Description |
| :--- | :--- | :--- | :--- |
| **Duration** | `5s`, `10s`, `15s` | `5s` | Temporal frame generation length. |
| **Aspect Ratio** | `16:9`, `9:16`, `1:1`, `21:9` | `16:9` | Output video dimensions. |
| **Motion Mode** | `normal`, `fun`, `spicy`, `high` | `normal` | Dynamism and temperature of physics engine. |
| **Camera Flow** | `pan_left`, `pan_right`, `zoom_in`, `zoom_out`, `orbit` | `none` | Programmatic camera trajectory token. |

---

## 3. Motion Brush Interactive Canvas & Vector Trajectories

The Motion Brush allows artists to paint mask regions onto the start-frame image and define directional motion vectors ($\vec{v} = [dx, dy]$).

```
+-------------------------------------------------------------------------+
| MOTION BRUSH CANVAS OVERLAY                                             |
|-------------------------------------------------------------------------|
|  [Brush: 35px] [Intensity: 7/10] [Direction Vector: ↗ (dx: 0.7, dy: -0.5)]
|                                                                         |
|         +---------------------------------------------+                 |
|         |            Uploaded Start Frame             |                 |
|         |                                             |                 |
|         |      [ Painted Mask Area with Neon Arrows]  |                 |
|         |               ↗  ↗  ↗  ↗                   |                 |
|         |                                             |                 |
|         +---------------------------------------------+                 |
|                                                                         |
|  [Controls: 🖌️ Paint | 🧹 Eraser | 🗑️ Clear All | 💾 Apply Trajectory]    |
+-------------------------------------------------------------------------+
```

### 3.1 Brush Canvas State Model
```typescript
export interface MotionVector {
  angleDegrees: number; // 0° (Right), 90° (Down), 180° (Left), 270° (Up)
  dx: number;           // cos(rad) * intensity (-1.0 to +1.0)
  dy: number;           // sin(rad) * intensity (-1.0 to +1.0)
  intensity: number;    // 1 to 10 scale
}

export interface MotionBrushLayer {
  id: string;
  name: string;
  colorHex: string;     // Neon highlight (e.g. #00dbe9 or #d9ff00)
  maskCanvas: HTMLCanvasElement;
  vector: MotionVector;
}
```

### 3.2 Vector Coordinate Math & Mask Compiler
When the user paints and sets a trajectory vector:
1. The canvas generates a binary alpha PNG mask where painted pixels are pure white (`#FFFFFF`) on a black background (`#000000`).
2. Vector calculation:
$$\text{rad} = \text{angleDegrees} \times \left(\frac{\pi}{180}\right)$$
$$dx = \cos(\text{rad}) \times \frac{\text{intensity}}{10.0}$$
$$dy = \sin(\text{rad}) \times \frac{\text{intensity}}{10.0}$$
3. The mask is converted to a blob and uploaded via `/api/v1/upload_file`.
4. The trajectory object `{ mask_url: string, dx: number, dy: number, intensity: number }` is attached to the generation payload.

---

## 4. Custom Looping Video Player & LaserFlow Telemetry

### 4.1 Player Features
- **Seamless HTML5 Video Playback**: Custom frameless controls with loop toggle.
- **Frame Step Controls**: Step forward / backward by individual frames ($1/24\text{s}$).
- **High-Bitrate MP4 Export**: Direct download button saving native source render.
- **Snapshot Extraction**: Extract current video frame to Image Studio reference tray.

### 4.2 LaserFlow Animated Telemetry Bar
During active generation, the viewport displays a dynamic progress bar:
```css
@keyframes laserFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.laser-flow-bar {
  background: linear-gradient(90deg, #00dbe9, #6366f1, #d9ff00, #00dbe9);
  background-size: 300% 300%;
  animation: laserFlow 2.5s ease infinite;
  height: 3px;
  border-radius: 9999px;
}
```
