import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isAllowed(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`) return true;
  const envPw = process.env.ADMIN_PASSWORD;
  if (envPw) {
    const url = new URL(request.url);
    if (url.searchParams.get("token") === envPw) return true;
  }
  return false;
}

export async function POST(request: Request) {
  if (!(await isAllowed(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      return NextResponse.json({ message: "Database already seeded" });
    }

    await prisma.category.createMany({
      data: [
        { name: "Android CarPlay", nameEn: "Android CarPlay", slug: "android-carplay" },
        { name: "Audio System", nameEn: "Audio System", slug: "audio-system" },
        { name: "Tint Film Window", nameEn: "Tint Film Window", slug: "tint-film-window" },
        { name: "LED Lights", nameEn: "LED Lights", slug: "led-lights" },
        { name: "Camera", nameEn: "Camera", slug: "camera" },
        { name: "Dash Camera", nameEn: "Dash Camera", slug: "dash-camera" },
      ],
    });

    const crypto = await import("node:crypto");
    const passwordHash = crypto.createHash("sha256").update("admin123").digest("hex");
    await prisma.admin.upsert({
      where: { username: "admin" },
      update: { password: passwordHash },
      create: { username: "admin", password: passwordHash, name: "Admin" },
    });

    return NextResponse.json({ message: "Seed completed successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
