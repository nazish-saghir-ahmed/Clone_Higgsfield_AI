# 08. Desktop Shell, Local Storage, and Security Architecture

## Overview & Architecture
Aether Neural Studio is engineered for dual deployment as a web application and a native desktop workstation powered by **Electron 33**. The system enforces a strict zero-trust security perimeter and manages persistent client-side state across browser LocalStorage and native filesystem APIs.

---

## 1. Electron 33 Native Shell Architecture

### 1.1 Main Window Configuration
```typescript
import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";

export function createStudioWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: "#06070a",
    titleBarStyle: "hiddenInset", // Frameless macOS style with native traffic lights
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,     // Enforces isolated JavaScript contexts
      nodeIntegration: false,    // Disables direct node access in renderer
      sandbox: true,             // Chromium sandbox activated
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Open external HTTP links in user's default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  return win;
}
```

### 1.2 IPC Native Bridge Protocol
Renderer communication is strictly gated through typed IPC channels exposed in `preload/index.ts`:

```typescript
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("aetherDesktop", {
  isDesktop: true,
  platform: process.platform,
  saveMediaFile: (buffer: ArrayBuffer, defaultFilename: string) => 
    ipcRenderer.invoke("media:save-file", { buffer, defaultFilename }),
  openExternalUrl: (url: string) => 
    ipcRenderer.invoke("shell:open-url", url)
});
```

---

## 2. Content Security Policy (CSP) & Defense-in-Depth

All HTML responses served by the application enforce the following CSP header:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.muapi.ai https://cdn.muapi.ai https://storage.muapi.ai; media-src 'self' data: blob: https://*.muapi.ai https://cdn.muapi.ai https://storage.muapi.ai; connect-src 'self' https://api.muapi.ai https://*.muapi.ai;
```

---

## 3. Persistent LocalStorage & Cache Schemas

The application persists user configuration, in-flight jobs, and generation histories strictly on the client side, eliminating unnecessary server-side session tracking.

### 3.1 `muapi_key`
- **Type**: `string`
- **Purpose**: Stores the user's encrypted or plaintext API key for gateway authorization.

### 3.2 `muapi_uploads` (Up to 20 Cached Assets)
- **Type**: `Array<UploadedAssetRecord>`
- **Schema**:
```typescript
export interface UploadedAssetRecord {
  id: string;             // UUID
  name: string;           // Original filename
  uploadedUrl: string;    // CDN edge URL (https://cdn.muapi.ai/...)
  thumbnail: string;      // 80x80 JPEG Base64 Data URL
  timestamp: string;      // ISO 8601 UTC
  fileSize: number;       // Bytes
  mimeType: string;       // image/png, audio/wav, etc.
}
```

### 3.3 `muapi_pending_jobs` (In-Flight Job Recovery)
- **Type**: `Array<PendingJobRecord>`
- **Purpose**: Enables seamless recovery and continued polling if the user refreshes or re-opens the studio while jobs are computing.
- **Schema**:
```typescript
export interface PendingJobRecord {
  requestId: string;
  modelId: string;
  studioType: "image" | "video" | "lipsync" | "cinema";
  prompt: string;
  startedAt: string;      // ISO 8601 UTC
  payload: Record<string, any>;
}
```

### 3.4 `muapi_history` (Studio History Array)
- **Type**: `Array<GenerationHistoryItem>`
- **Schema**:
```typescript
export interface GenerationHistoryItem {
  id: string;
  requestId: string;
  studioType: "image" | "video" | "lipsync" | "cinema";
  modelId: string;
  modelName: string;
  prompt: string;
  outputUrl: string;
  thumbnailUrl?: string;
  mediaType: "image" | "video";
  aspectRatio?: string;
  resolution?: string;
  executionSeconds?: number;
  timestamp: string;      // ISO 8601 UTC
}
```
