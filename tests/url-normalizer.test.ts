import { describe, it, expect } from "vitest";
import { normalizeOutputUrl } from "@/lib/url-normalizer";

describe("normalizeOutputUrl", () => {
  it("extracts URL from outputs array of strings", () => {
    const raw = { outputs: ["https://cdn.muapi.ai/res1.png", "https://cdn.muapi.ai/res2.png"] };
    expect(normalizeOutputUrl(raw)).toBe("https://cdn.muapi.ai/res1.png");
  });

  it("extracts URL from outputs array of objects", () => {
    const raw = { outputs: [{ url: "https://cdn.muapi.ai/res_obj.mp4" }] };
    expect(normalizeOutputUrl(raw)).toBe("https://cdn.muapi.ai/res_obj.mp4");
  });

  it("extracts direct url string property", () => {
    const raw = { url: "https://storage.muapi.ai/direct.jpg" };
    expect(normalizeOutputUrl(raw)).toBe("https://storage.muapi.ai/direct.jpg");
  });

  it("extracts direct file_url string property", () => {
    const raw = { file_url: "https://storage.muapi.ai/direct_file.mp4" };
    expect(normalizeOutputUrl(raw)).toBe("https://storage.muapi.ai/direct_file.mp4");
  });

  it("extracts URL from nested output string or object", () => {
    const rawString = { output: "https://cdn.muapi.ai/nested.png" };
    expect(normalizeOutputUrl(rawString)).toBe("https://cdn.muapi.ai/nested.png");

    const rawObj = { output: { url: "https://cdn.muapi.ai/nested_obj.mp4" } };
    expect(normalizeOutputUrl(rawObj)).toBe("https://cdn.muapi.ai/nested_obj.mp4");

    const rawArray = { output: ["https://cdn.muapi.ai/nested_arr.png"] };
    expect(normalizeOutputUrl(rawArray)).toBe("https://cdn.muapi.ai/nested_arr.png");
  });

  it("extracts URL from nested result property", () => {
    const raw = { result: { url: "https://cdn.muapi.ai/result.png" } };
    expect(normalizeOutputUrl(raw)).toBe("https://cdn.muapi.ai/result.png");
  });

  it("returns null on empty, undefined, or invalid responses", () => {
    expect(normalizeOutputUrl(null)).toBeNull();
    expect(normalizeOutputUrl(undefined)).toBeNull();
    expect(normalizeOutputUrl({})).toBeNull();
    expect(normalizeOutputUrl({ outputs: [] })).toBeNull();
  });
});
