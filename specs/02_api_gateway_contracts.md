# 02. API Gateway Contracts & Network Protocol

## Overview & Network Topology
Aether Neural Studio interfaces with universal neural inference backends through a unified REST gateway protocol. The primary production endpoint is hosted at `https://api.muapi.ai`, with comprehensive support for dynamic host overrides to support custom private clusters, self-hosted proxy layers, or enterprise staging environments.

---

## 1. Network Configuration & Authentication

### 1.1 Base Gateway Addressing
- **Default Production Base URL**: `https://api.muapi.ai`
- **Dynamic Override Key**: `localStorage.getItem('aether_gateway_url') || 'https://api.muapi.ai'`
- **Protocol**: HTTPS / TLS 1.3 enforced.

### 1.2 Authentication Protocol
All REST requests dispatched to the gateway MUST include the custom authorization header:
```http
x-api-key: <USER_SECRET_API_KEY>
Content-Type: application/json
Accept: application/json
```
If `x-api-key` is missing or invalid, the gateway returns HTTP `401 Unauthorized`. The client layer catches this code to invoke the `BYOKAuthModal` (Bring Your Own Key) overlay.

---

## 2. Asynchronous Job Submission Contract

Generative inference tasks are long-running computational jobs requiring an asynchronous **Submit-and-Poll** transaction model.

### 2.1 HTTP Request Specification
- **Method**: `POST`
- **Route**: `/api/v1/{endpoint}`
- **Headers**:
  - `x-api-key: {key}`
  - `Content-Type: application/json`

#### Request Payload JSON Schema:
```typescript
export interface JobSubmissionPayload {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";
  resolution?: "1K" | "2K" | "4K";
  quality?: "basic" | "high" | "extreme";
  duration?: 5 | 10 | 15;
  mode?: "normal" | "fun" | "spicy";
  
  // Single image input models
  image_url?: string;
  
  // Multi-image reference models (up to 14 slots)
  images_list?: string[];
  
  // Audio conditioning models
  audio_url?: string;
  video_url?: string;
  
  // Motion brush coordinates & trajectories
  motion_trajectories?: Array<{
    mask_url: string;
    dx: number;
    dy: number;
    intensity: number;
  }>;
}
```

### 2.2 Immediate Submission Response
- **HTTP Status**: `200 OK` or `202 Accepted`
- **Response Shape**:
```json
{
  "request_id": "req_8f3a9e21-bc74-4b55-912a-3a1052de449f",
  "status": "starting",
  "created_at": "2026-10-01T12:00:00.000Z"
}
```

---

## 3. Polling Engine & Status Reconciliation

Once a `request_id` is received, the client orchestrates an active polling lifecycle to monitor generation progress.

### 3.1 HTTP Polling Request
- **Method**: `GET`
- **Route**: `/api/v1/predictions/{request_id}/result`
- **Headers**:
  - `x-api-key: {key}`

### 3.2 Gateway Response Lifecycle States
The gateway returns intermediate and terminal state objects:

```typescript
export type JobStatus = 
  | "starting"    // Job initialized in queue
  | "queued"      // Allocated GPU instance pending
  | "processing"  // Model actively executing diffusion/transformer steps
  | "completed"   // Generation finished successfully
  | "succeeded"   // Alternative success code
  | "failed"      // Unrecoverable inference error
  | "error";      // Gateway or cluster level fault
```

#### Intermediate Polling Response Example:
```json
{
  "request_id": "req_8f3a9e21-bc74-4b55-912a-3a1052de449f",
  "status": "processing",
  "progress": 0.65,
  "execution_time_seconds": 4.2
}
```

#### Terminal Successful Response Example:
```json
{
  "request_id": "req_8f3a9e21-bc74-4b55-912a-3a1052de449f",
  "status": "completed",
  "outputs": [
    "https://storage.muapi.ai/renders/req_8f3a9e21_001.mp4"
  ],
  "completed_at": "2026-10-01T12:00:14.200Z"
}
```

### 3.3 Output URL Normalization Strategy
Due to variations in underlying model serialization adapters, output URLs can arrive in varied structural shapes. The client executes a deterministic URL normalization parser:

```typescript
export function normalizeOutputUrl(rawResponse: any): string | null {
  if (!rawResponse) return null;

  // 1. Array of outputs
  if (Array.isArray(rawResponse.outputs) && rawResponse.outputs.length > 0) {
    const candidate = rawResponse.outputs[0];
    if (typeof candidate === "string") return candidate;
    if (candidate && typeof candidate === "object" && candidate.url) return candidate.url;
  }

  // 2. Direct string URL
  if (typeof rawResponse.url === "string") {
    return rawResponse.url;
  }

  // 3. Nested output object
  if (rawResponse.output) {
    if (typeof rawResponse.output === "string") return rawResponse.output;
    if (typeof rawResponse.output.url === "string") return rawResponse.output.url;
    if (Array.isArray(rawResponse.output) && rawResponse.output.length > 0) {
      return typeof rawResponse.output[0] === "string" 
        ? rawResponse.output[0] 
        : rawResponse.output[0]?.url || null;
    }
  }

  // 4. Fallback for result object
  if (rawResponse.result && typeof rawResponse.result.url === "string") {
    return rawResponse.result.url;
  }

  return null;
}
```

### 3.4 Polling Retry, Backoff, and Timeout Policy
- **Base Polling Interval**: `2000ms` (2.0 seconds).
- **Error Backoff**: If an HTTP `5xx` server error or network disconnect occurs, back off by `interval * 1.5` up to a maximum interval of `8000ms`.
- **Maximum Execution Limits**:
  - **Image Generation (T2I / I2I)**: 60 attempts (~120 seconds total before timeout).
  - **Video / Lip Sync Generation (T2V / I2V / Talk)**: 900 attempts (~1800 seconds / 30 minutes before timeout).
- **Abort Signal**: Every polling loop attaches an `AbortController` instance triggered whenever the user clicks "Cancel" or closes the active workspace.

---

## 4. High-Throughput Multipart Upload Protocol

Image and audio reference files must be uploaded to the high-speed edge CDN before submitting the generation payload.

### 4.1 HTTP Request Specification
- **Method**: `POST`
- **Route**: `/api/v1/upload_file`
- **Headers**:
  - `x-api-key: {key}`
  - `Content-Type: multipart/form-data`
- **Body**: Standard `FormData` with field `file`: binary file payload (JPEG, PNG, WEBP, MP3, WAV, MP4).

### 4.2 Upload Progress Telemetry
The client attaches an `onUploadProgress` event listener to track real-time upload status:
$$\text{Progress \%} = \min\left(100, \left\lfloor \frac{\text{event.loaded}}{\text{event.total}} \times 100 \right\rfloor\right)$$

### 4.3 Upload Response Contract
```json
{
  "url": "https://cdn.muapi.ai/uploads/2026/10/img_9a184c.png",
  "file_url": "https://cdn.muapi.ai/uploads/2026/10/img_9a184c.png",
  "mime_type": "image/png",
  "size_bytes": 2048576
}
```
The client caches this returned URL and associates it with the local 80x80 thumbnail in `muapi_uploads`.
