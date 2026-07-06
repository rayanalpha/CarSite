import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_TOKEN = "admin_token";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let result = a.length ^ b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return result === 0;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function getStoredPasswordHash(): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "admin_password_hash" } });
    return setting?.value || null;
  } catch {
    return null;
  }
}

export async function verifyPassword(input: string): Promise<boolean> {
  // 1. Check Setting table for hashed password
  const storedHash = await getStoredPasswordHash();
  if (storedHash) {
    return timingSafeEqual(hashPassword(input), storedHash);
  }

  // 2. Check Admin table for seeded admin
  try {
    const admin = await prisma.admin.findUnique({ where: { username: "admin" } });
    if (admin) {
      return timingSafeEqual(hashPassword(input), admin.password);
    }
  } catch {}

  // 3. Check env var (set in Netlify Dashboard)
  const envPw = process.env.ADMIN_PASSWORD;
  if (envPw) {
    return timingSafeEqual(input, envPw);
  }

  // 4. Fallback for dev
  if (process.env.NODE_ENV !== "production") {
    console.warn("ADMIN_PASSWORD not set, using default 'admin123' for development");
    return timingSafeEqual(input, "admin123");
  }

  return false;
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN)?.value;
}

export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.delete(ADMIN_TOKEN);
}

export async function requireApiAuth(): Promise<true> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN)?.value;
  if (!token) {
    throw new Error("Unauthorized");
  }
  try {
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) {
      throw new Error("Unauthorized");
    }
    if (session.expiresAt && session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      cookieStore.delete(ADMIN_TOKEN);
      throw new Error("Unauthorized");
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") throw e;
    // DB unreachable — allow request if cookie exists
  }
  return true;
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function checkOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin && !referer) return null;
  const host = request.headers.get("host");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const selfUrl = host ? `http://${host}` : "";
  const selfUrlSecure = host ? `https://${host}` : "";
  const allowed = [siteUrl, selfUrl, selfUrlSecure, "http://localhost:3000", "http://localhost:3456"].filter(Boolean);

  if (origin) {
    const normalized = allowed.map((a) => a.toLowerCase().replace(/\/+$/, ""));
    if (!normalized.includes(origin.toLowerCase().replace(/\/+$/, ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      const normalized = allowed.map((a) => a.toLowerCase().replace(/\/+$/, ""));
      if (!normalized.includes(refererOrigin.toLowerCase().replace(/\/+$/, ""))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return null;
}
