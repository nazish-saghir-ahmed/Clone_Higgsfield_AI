import { GenerationHistoryItem, PendingJobRecord, UploadedAssetRecord } from "./types";

const STORAGE_KEYS = {
  API_KEY: "muapi_key",
  GATEWAY_URL: "muapi_gateway_url",
  UPLOADS: "muapi_uploads",
  PENDING_JOBS: "muapi_pending_jobs",
  HISTORY: "muapi_history",
};

export const DEFAULT_GATEWAY_URL = "https://api.muapi.ai";

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
}

export function setApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
}

export function getGatewayUrl(): string {
  if (typeof window === "undefined") return DEFAULT_GATEWAY_URL;
  return localStorage.getItem(STORAGE_KEYS.GATEWAY_URL) || DEFAULT_GATEWAY_URL;
}

export function setGatewayUrl(url: string): void {
  if (typeof window === "undefined") return;
  if (url.trim()) {
    localStorage.setItem(STORAGE_KEYS.GATEWAY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.GATEWAY_URL);
  }
}

// ==========================================
// UPLOADS STORAGE (Up to 20 assets)
// ==========================================
export function getStoredUploads(): UploadedAssetRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPLOADS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUploadedAsset(asset: UploadedAssetRecord): void {
  if (typeof window === "undefined") return;
  const current = getStoredUploads().filter((item) => item.id !== asset.id);
  const updated = [asset, ...current].slice(0, 20); // Cap at 20 assets
  localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(updated));
}

export function removeUploadedAsset(id: string): void {
  if (typeof window === "undefined") return;
  const filtered = getStoredUploads().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(filtered));
}

// ==========================================
// PENDING JOBS STORAGE (In-Flight Recovery)
// ==========================================
export function getPendingJobs(): PendingJobRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_JOBS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addPendingJob(job: PendingJobRecord): void {
  if (typeof window === "undefined") return;
  const current = getPendingJobs().filter((j) => j.requestId !== job.requestId);
  localStorage.setItem(STORAGE_KEYS.PENDING_JOBS, JSON.stringify([...current, job]));
}

export function removePendingJob(requestId: string): void {
  if (typeof window === "undefined") return;
  const filtered = getPendingJobs().filter((j) => j.requestId !== requestId);
  localStorage.setItem(STORAGE_KEYS.PENDING_JOBS, JSON.stringify(filtered));
}

// ==========================================
// HISTORY STORAGE
// ==========================================
export function getHistory(): GenerationHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryItem(item: GenerationHistoryItem): void {
  if (typeof window === "undefined") return;
  const current = getHistory().filter((h) => h.id !== item.id && h.requestId !== item.requestId);
  const updated = [item, ...current].slice(0, 100); // Cap at 100 items
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
}

export function removeHistoryItem(id: string): void {
  if (typeof window === "undefined") return;
  const filtered = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}
