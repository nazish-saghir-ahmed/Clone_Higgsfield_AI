/**
 * Normalizes output URLs from heterogeneous model gateway response formats.
 */
export function normalizeOutputUrl(rawResponse: any): string | null {
  if (!rawResponse) return null;

  // 1. Direct array in outputs field
  if (Array.isArray(rawResponse.outputs) && rawResponse.outputs.length > 0) {
    const candidate = rawResponse.outputs[0];
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
    if (candidate && typeof candidate === "object") {
      if (typeof candidate.url === "string") return candidate.url.trim();
      if (typeof candidate.file_url === "string") return candidate.file_url.trim();
    }
  }

  // 2. Direct string URL field
  if (typeof rawResponse.url === "string" && rawResponse.url.trim().length > 0) {
    return rawResponse.url.trim();
  }
  if (typeof rawResponse.file_url === "string" && rawResponse.file_url.trim().length > 0) {
    return rawResponse.file_url.trim();
  }

  // 3. Nested output field (object, string, or array)
  if (rawResponse.output) {
    if (typeof rawResponse.output === "string" && rawResponse.output.trim().length > 0) {
      return rawResponse.output.trim();
    }
    if (typeof rawResponse.output === "object") {
      if (typeof rawResponse.output.url === "string") return rawResponse.output.url.trim();
      if (typeof rawResponse.output.file_url === "string") return rawResponse.output.file_url.trim();
      if (Array.isArray(rawResponse.output) && rawResponse.output.length > 0) {
        const item = rawResponse.output[0];
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && typeof item.url === "string") return item.url.trim();
      }
    }
  }

  // 4. Nested result field
  if (rawResponse.result) {
    if (typeof rawResponse.result === "string" && rawResponse.result.trim().length > 0) {
      return rawResponse.result.trim();
    }
    if (typeof rawResponse.result === "object") {
      if (typeof rawResponse.result.url === "string") return rawResponse.result.url.trim();
      if (Array.isArray(rawResponse.result.outputs) && rawResponse.result.outputs.length > 0) {
        const item = rawResponse.result.outputs[0];
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && typeof item.url === "string") return item.url.trim();
      }
    }
  }

  // 5. Direct data URI or media key
  if (typeof rawResponse.image === "string") return rawResponse.image.trim();
  if (typeof rawResponse.video === "string") return rawResponse.video.trim();

  return null;
}
