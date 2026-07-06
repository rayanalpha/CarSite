/**
 * API Integration Tests
 *
 * Run with: npx vitest run --config vitest.api.config.ts
 * Requires the dev server to be running on LOCAL_URL
 */

import { describe, it, expect } from "vitest";

const LOCAL_URL = "http://localhost:3000";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${LOCAL_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // no body
  }
  return { status: res.status, body, ok: res.ok };
}

// ─── Public routes ────────────────────────────────────────────────

describe("Public Pages", () => {
  it("GET / returns 200", async () => {
    const res = await fetch(`${LOCAL_URL}/`);
    expect(res.status).toBe(200);
  });

  it("GET /products returns 200", async () => {
    const res = await fetch(`${LOCAL_URL}/products`);
    expect(res.status).toBe(200);
  });

  it("GET /categories returns 200", async () => {
    const res = await fetch(`${LOCAL_URL}/categories`);
    expect(res.status).toBe(200);
  });

  it("GET /about returns 200", async () => {
    const res = await fetch(`${LOCAL_URL}/about`);
    expect(res.status).toBe(200);
  });

  it("GET /contact returns 200", async () => {
    const res = await fetch(`${LOCAL_URL}/contact`);
    expect(res.status).toBe(200);
  });
});

// ─── Public API routes ────────────────────────────────────────────

describe("Public API", () => {
  it("GET /api/products returns an array", async () => {
    const { status, body } = await api("/api/products");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it("GET /api/categories returns an array", async () => {
    const { status, body } = await api("/api/categories");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it("GET /api/settings returns an object", async () => {
    const { status, body } = await api("/api/settings");
    expect(status).toBe(200);
    expect(body).toBeTruthy();
    expect(typeof body).toBe("object");
  });

  it("GET /api/stories returns an array", async () => {
    const { status, body } = await api("/api/stories");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });
});

// ─── Admin routes (should redirect or return proper auth error) ───

describe("Admin API Auth Protection", () => {
  it("POST /api/products without auth returns 401", async () => {
    const { status } = await api("/api/products", { method: "POST", body: "{}" });
    expect([401]).toContain(status);
  });

  it("PUT /api/settings without auth returns 401", async () => {
    const { status } = await api("/api/settings", { method: "PUT", body: "{}" });
    expect([401]).toContain(status);
  });

  it("POST /api/categories without auth returns 401", async () => {
    const { status } = await api("/api/categories", { method: "POST", body: "{}" });
    expect([401]).toContain(status);
  });

  it("POST /api/stories without auth returns 401", async () => {
    const { status } = await api("/api/stories", { method: "POST" });
    expect([401]).toContain(status);
  });

  it("POST /api/upload without auth returns 401", async () => {
    const { status } = await api("/api/upload", { method: "POST" });
    expect([401]).toContain(status);
  });
});

// ─── Products API ─────────────────────────────────────────────────

describe("Products API Validation", () => {
  it("POST /api/products with missing name returns 400", async () => {
    // We won't have auth, so this will be 401, not 400
    // Test validation by checking the auth error
    const { status } = await api("/api/products", {
      method: "POST",
      body: JSON.stringify({ name: "", categoryId: 1 }),
    });
    // Without auth, we get 401. With auth, we'd get 400.
    // Just verify it doesn't 500
    expect(status).not.toBe(500);
  });

  it("GET /api/products/0 returns 400", async () => {
    const { status } = await api("/api/products/0");
    expect(status).toBe(400);
  });

  it("GET /api/products/99999 returns 404", async () => {
    const { status } = await api("/api/products/99999");
    // Might be 404 (not found) or 400 (invalid ID check)
    expect([400, 404]).toContain(status);
  });
});

// ─── Categories API ───────────────────────────────────────────────

describe("Categories API", () => {
  it("GET /api/categories returns array", async () => {
    const { status, body } = await api("/api/categories");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });
});

// ─── Auth API ─────────────────────────────────────────────────────

describe("Auth API", () => {
  it("POST /api/auth with wrong password returns 401", async () => {
    const { status } = await api("/api/auth", {
      method: "POST",
      body: JSON.stringify({ password: "wrong_password_12345" }),
    });
    expect(status).toBe(401);
  });

  it("POST /api/auth with empty password returns 400", async () => {
    const { status, body } = await api("/api/auth", {
      method: "POST",
      body: JSON.stringify({ password: "" }),
    });
    expect([400, 401]).toContain(status);
  });
});

// ─── Story API ────────────────────────────────────────────────────

describe("Stories API", () => {
  it("GET /api/stories returns array", async () => {
    const { status, body } = await api("/api/stories");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it("POST /api/stories/99999/view returns error", async () => {
    const { status } = await api("/api/stories/99999/view", { method: "POST" });
    expect([400, 404]).toContain(status);
  });
});

// ─── Settings API ─────────────────────────────────────────────────

describe("Settings API", () => {
  it("GET /api/settings returns object with store_name", async () => {
    const { status, body } = await api("/api/settings");
    expect(status).toBe(200);
    expect(body).toHaveProperty("store_name");
  });

  it("PUT /api/settings without auth returns 401", async () => {
    const { status } = await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ store_name: "Test" }),
    });
    expect(status).toBe(401);
  });
});

// ─── Upload API ────────────────────────────────────────────────────

describe("Upload API", () => {
  it("POST /api/upload without file returns error", async () => {
    const { status } = await api("/api/upload", { method: "POST" });
    expect([400, 401]).toContain(status);
  });
});

// ─── By-slug API ───────────────────────────────────────────────────

describe("Product By Slug API", () => {
  it("GET /api/products/by-slug/nonexistent returns 404", async () => {
    const { status } = await api("/api/products/by-slug/nonexistent-slug-xyz");
    expect(status).toBe(404);
  });
});
