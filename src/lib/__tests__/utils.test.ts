import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { slugify } from "../utils";

describe("slugify", () => {
  it("converts basic text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("trims whitespace", () => {
    expect(slugify("  Hello   World  ")).toBe("hello-world");
  });

  it("converts to lowercase", () => {
    expect(slugify("HELLO WORLD")).toBe("hello-world");
  });

  it("handles multiple hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("returns 'untitled' for null", () => {
    expect(slugify(null)).toBe("untitled");
  });

  it("returns 'untitled' for undefined", () => {
    expect(slugify(undefined)).toBe("untitled");
  });

  it("returns 'untitled' for empty string", () => {
    expect(slugify("")).toBe("untitled");
  });

  it("handles persian characters", () => {
    const result = slugify("محصول جدید");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("handles numbers", () => {
    expect(slugify("Product 123")).toBe("product-123");
  });
});
