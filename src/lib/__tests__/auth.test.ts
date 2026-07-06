import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { hashPassword, timingSafeEqual } from "../auth";

describe("hashPassword", () => {
  it("returns consistent hashes for same input", () => {
    const h1 = hashPassword("admin123");
    const h2 = hashPassword("admin123");
    expect(h1).toBe(h2);
  });

  it("returns different hashes for different inputs", () => {
    const h1 = hashPassword("admin123");
    const h2 = hashPassword("admin456");
    expect(h1).not.toBe(h2);
  });

  it("returns a 64-char hex string", () => {
    const hash = hashPassword("test");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("timingSafeEqual", () => {
  it("returns true for equal strings", () => {
    expect(timingSafeEqual("hello", "hello")).toBe(true);
  });

  it("returns false for different strings", () => {
    expect(timingSafeEqual("hello", "world")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });

  it("returns false for empty vs non-empty", () => {
    expect(timingSafeEqual("", "a")).toBe(false);
  });

  it("returns true for both empty", () => {
    expect(timingSafeEqual("", "")).toBe(true);
  });

  it("handles long strings", () => {
    const a = "x".repeat(1000);
    const b = "x".repeat(1000);
    expect(timingSafeEqual(a, b)).toBe(true);
  });
});
