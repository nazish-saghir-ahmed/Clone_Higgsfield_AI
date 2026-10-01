import { describe, it, expect } from "vitest";
import { computeMotionVector } from "@/lib/motion-brush";

describe("motion-brush", () => {
  it("computes horizontal right motion vector (0 degrees)", () => {
    const vec = computeMotionVector(0, 10);
    expect(vec.dx).toBe(1.0);
    expect(vec.dy).toBe(0.0);
    expect(vec.intensity).toBe(10);
  });

  it("computes vertical downward motion vector (90 degrees)", () => {
    const vec = computeMotionVector(90, 5);
    expect(vec.dx).toBeCloseTo(0.0, 2);
    expect(vec.dy).toBe(0.5);
    expect(vec.intensity).toBe(5);
  });

  it("computes 45-degree diagonal motion vector", () => {
    const vec = computeMotionVector(45, 10);
    expect(vec.dx).toBeCloseTo(0.707, 2);
    expect(vec.dy).toBeCloseTo(0.707, 2);
  });

  it("clamps intensity between 1 and 10", () => {
    const low = computeMotionVector(0, -5);
    expect(low.intensity).toBe(1);

    const high = computeMotionVector(0, 99);
    expect(high.intensity).toBe(10);
  });
});
