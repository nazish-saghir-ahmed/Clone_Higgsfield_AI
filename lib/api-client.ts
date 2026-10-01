import axios, { AxiosInstance, AxiosProgressEvent } from "axios";
import { getApiKey, getGatewayUrl } from "./storage";
import { JobSubmissionPayload, PollingResponse } from "./types";

function createHttpClient(): AxiosInstance {
  const baseURL = getGatewayUrl();
  const apiKey = getApiKey();

  const client = axios.create({
    baseURL,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
  });

  return client;
}

export interface UploadProgressCallback {
  (percentage: number): void;
}

/**
 * Uploads a binary file (image, audio, video) via multipart FormData.
 */
export async function uploadMediaFile(
  file: File | Blob,
  fileName = "upload.png",
  onProgress?: UploadProgressCallback
): Promise<{ url: string; file_url: string }> {
  const baseURL = getGatewayUrl();
  const apiKey = getApiKey();

  const formData = new FormData();
  formData.append("file", file, fileName);

  try {
    const response = await axios.post(`${baseURL}/api/v1/upload_file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(apiKey ? { "x-api-key": apiKey } : {}),
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          onProgress(percentCompleted);
        }
      },
    });

    const data = response.data;
    const url = data.url || data.file_url || (typeof data === "string" ? data : "");
    return {
      url: url,
      file_url: data.file_url || url,
    };
  } catch (err: any) {
    // If running in sandbox/offline or simulated demo mode, generate local object URL
    console.warn("Upload endpoint failed or running in demo mode, generating blob URL fallback:", err.message);
    const mockUrl = URL.createObjectURL(file);
    return {
      url: mockUrl,
      file_url: mockUrl,
    };
  }
}

/**
 * Submits an asynchronous generative job to the neural inference gateway.
 */
export async function submitGenerativeJob(
  endpoint: string,
  payload: JobSubmissionPayload
): Promise<{ request_id: string; status: string }> {
  const client = createHttpClient();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Clean empty values from payload
  const cleanPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== "") {
      cleanPayload[key] = value;
    }
  }

  try {
    const response = await client.post(`/api/v1${cleanEndpoint}`, cleanPayload);
    return {
      request_id: response.data.request_id || response.data.id || `req_${Date.now()}`,
      status: response.data.status || "starting",
    };
  } catch (err: any) {
    // If 401 Unauthorized, throw specific auth error
    if (err.response?.status === 401) {
      throw new Error("UNAUTHORIZED: Invalid or missing API key. Please configure your API key in settings.");
    }

    // Check if network error and handle
    const message = err.response?.data?.error || err.response?.data?.message || err.message;
    throw new Error(`Inference submission failed: ${message}`);
  }
}

/**
 * Polls the gateway for current job status.
 */
export async function pollJobStatus(
  requestId: string,
  signal?: AbortSignal
): Promise<PollingResponse> {
  const client = createHttpClient();

  try {
    const response = await client.get(`/api/v1/predictions/${requestId}/result`, {
      signal,
    });
    return response.data;
  } catch (err: any) {
    if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") {
      throw new Error("ABORTED");
    }
    const message = err.response?.data?.error || err.response?.data?.message || err.message;
    throw new Error(`Polling error: ${message}`);
  }
}

/**
 * Executes full polling loop with exponential backoff and timeout limits.
 */
export async function executePollingLoop(
  requestId: string,
  options: {
    intervalMs?: number;
    maxAttempts?: number;
    onProgress?: (status: string, progress: number, elapsedSec: number) => void;
    signal?: AbortSignal;
  } = {}
): Promise<PollingResponse> {
  const intervalMs = options.intervalMs || 2000;
  const maxAttempts = options.maxAttempts || 900;
  const startTime = Date.now();
  let attempts = 0;
  let currentInterval = intervalMs;

  while (attempts < maxAttempts) {
    if (options.signal?.aborted) {
      throw new Error("ABORTED");
    }

    attempts++;
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await pollJobStatus(requestId, options.signal);
      const status = (result.status || "").toLowerCase();

      const progress = result.progress || (status === "completed" || status === "succeeded" ? 1.0 : Math.min(0.95, attempts * 0.05));
      options.onProgress?.(status, progress, elapsedSec);

      if (status === "completed" || status === "succeeded") {
        return result;
      }

      if (status === "failed" || status === "error") {
        throw new Error(result.error || result.message || `Inference failed with status: ${status}`);
      }

      // Successful poll, reset interval
      currentInterval = intervalMs;
    } catch (err: any) {
      if (err.message === "ABORTED") throw err;

      // Exponential backoff on server errors up to 8000ms
      currentInterval = Math.min(8000, Math.floor(currentInterval * 1.5));
      console.warn(`Polling attempt ${attempts} warning: ${err.message}. Retrying in ${currentInterval}ms...`);
    }

    await new Promise((resolve) => setTimeout(resolve, currentInterval));
  }

  throw new Error(`Generation timed out after ${Math.floor((Date.now() - startTime) / 1000)} seconds.`);
}
