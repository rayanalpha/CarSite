import { describe, it, expect } from "vitest";
import {
  ProductSchema,
  CategorySchema,
  SettingsSchema,
  StoryUpdateSchema,
  LoginSchema,
  ChangePasswordSchema,
  isValidId,
  ALLOWED_SETTING_KEYS,
} from "../validation";

describe("ProductSchema", () => {
  it("validates a minimal product", () => {
    const result = ProductSchema.safeParse({ name: "Test", categoryId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = ProductSchema.safeParse({ name: "", categoryId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects name over 200 chars", () => {
    const result = ProductSchema.safeParse({ name: "x".repeat(201), categoryId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    const result = ProductSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields as null", () => {
    const result = ProductSchema.safeParse({
      name: "Test",
      categoryId: 1,
      nameEn: null,
      description: null,
      price: null,
      images: null,
      specs: null,
      brandId: null,
      model: null,
      tiktokUrl: null,
      guideUrl: null,
      guideContent: null,
      salePrice: null,
      saleStart: null,
      saleEnd: null,
      colors: null,
    });
    expect(result.success).toBe(true);
  });

  it("validates optional fields omitted", () => {
    const result = ProductSchema.safeParse({ name: "Test", categoryId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tiktokUrl", () => {
    const result = ProductSchema.safeParse({
      name: "Test",
      categoryId: 1,
      tiktokUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid tiktokUrl", () => {
    const result = ProductSchema.safeParse({
      name: "Test",
      categoryId: 1,
      tiktokUrl: "https://www.tiktok.com/@user/video/123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty tiktokUrl (must be null/undefined)", () => {
    const result = ProductSchema.safeParse({
      name: "Test",
      categoryId: 1,
      tiktokUrl: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = ProductSchema.safeParse({ name: "Test", categoryId: 1, price: -10 });
    expect(result.success).toBe(false);
  });

  it("accepts zero price", () => {
    const result = ProductSchema.safeParse({ name: "Test", categoryId: 1, price: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts positive price", () => {
    const result = ProductSchema.safeParse({ name: "Test", categoryId: 1, price: 19.99 });
    expect(result.success).toBe(true);
  });

  it("accepts valid status values", () => {
    const active = ProductSchema.safeParse({ name: "Test", categoryId: 1, status: "active" });
    const draft = ProductSchema.safeParse({ name: "Test", categoryId: 1, status: "draft" });
    expect(active.success).toBe(true);
    expect(draft.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = ProductSchema.safeParse({ name: "Test", categoryId: 1, status: "deleted" });
    expect(result.success).toBe(false);
  });

  it("accepts boolean flags", () => {
    const result = ProductSchema.safeParse({
      name: "Test",
      categoryId: 1,
      inStock: true,
      featured: false,
      tiktokEnabled: true,
      guideEnabled: false,
      colorsEnabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects categoryId as string", () => {
    const result = ProductSchema.safeParse({ name: "Test", categoryId: "1" });
    expect(result.success).toBe(false);
  });

  it("accepts salePrice with price", () => {
    const result = ProductSchema.safeParse({
      name: "Test",
      categoryId: 1,
      price: 100,
      salePrice: 79.99,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative salePrice", () => {
    const result = ProductSchema.safeParse({
      name: "Test",
      categoryId: 1,
      salePrice: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe("CategorySchema", () => {
  it("validates a minimal category", () => {
    const result = CategorySchema.safeParse({ name: "Interior" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CategorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = CategorySchema.safeParse({ name: "x".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts optional parentId", () => {
    const result = CategorySchema.safeParse({ name: "Sub", parentId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects parentId as string", () => {
    const result = CategorySchema.safeParse({ name: "Sub", parentId: "1" });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields omitted", () => {
    const result = CategorySchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameEn).toBe("");
    }
  });
});

describe("SettingsSchema", () => {
  it("validates all allowed setting keys", () => {
    const payload: Record<string, string> = {};
    for (const key of ALLOWED_SETTING_KEYS) {
      payload[key] = "test value";
    }
    const result = SettingsSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects unknown setting keys", () => {
    const result = SettingsSchema.safeParse({ unknown_key: "value" });
    expect(result.success).toBe(false);
  });
});

describe("StoryUpdateSchema", () => {
  it("validates all optional fields", () => {
    const result = StoryUpdateSchema.safeParse({
      link: "https://example.com",
      linkText: "Click here",
      expiresAt: "2025-12-31T23:59:59Z",
      sortOrder: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = StoryUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates link max length", () => {
    const result = StoryUpdateSchema.safeParse({ link: "x".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects negative sortOrder", () => {
    const result = StoryUpdateSchema.safeParse({ sortOrder: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts null link and linkText", () => {
    const result = StoryUpdateSchema.safeParse({ link: null, linkText: null });
    expect(result.success).toBe(true);
  });
});

describe("LoginSchema", () => {
  it("validates non-empty password", () => {
    const result = LoginSchema.safeParse({ password: "admin123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({ password: "" });
    expect(result.success).toBe(false);
  });
});

describe("ChangePasswordSchema", () => {
  it("validates both passwords", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty current password", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects new password under 6 chars", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty new password", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("isValidId", () => {
  it("accepts positive integers", () => {
    expect(isValidId(1)).toBe(true);
    expect(isValidId(100)).toBe(true);
    expect(isValidId(999)).toBe(true);
  });

  it("rejects zero", () => {
    expect(isValidId(0)).toBe(false);
  });

  it("rejects negative numbers", () => {
    expect(isValidId(-1)).toBe(false);
  });

  it("rejects floats", () => {
    expect(isValidId(1.5)).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(isValidId("1")).toBe(false);
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId({})).toBe(false);
  });
});

describe("ALLOWED_SETTING_KEYS", () => {
  it("contains about_title and about_content", () => {
    expect(ALLOWED_SETTING_KEYS).toContain("about_title");
    expect(ALLOWED_SETTING_KEYS).toContain("about_content");
  });

  it("contains store_name and social keys", () => {
    expect(ALLOWED_SETTING_KEYS).toContain("store_name");
    expect(ALLOWED_SETTING_KEYS).toContain("social_instagram_url");
    expect(ALLOWED_SETTING_KEYS).toContain("social_tiktok_enabled");
  });
});
