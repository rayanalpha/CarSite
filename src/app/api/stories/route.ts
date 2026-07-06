import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { mkdir } from "fs/promises";
import path from "path";
import { requireApiAuth, unauthorized } from "@/lib/auth";

process.env.LIBHEIF_SECURITY_LIMITS = "OFF";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(stories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    await prisma.story.deleteMany({
      where: { expiresAt: { lte: new Date(), not: null } },
    });

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const link = (formData.get("link") as string) || null;
    const linkText = (formData.get("linkText") as string) || null;
    const sortOrderStr = (formData.get("sortOrder") as string) || "0";

    if (!file) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP images allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (link && !link.startsWith("http://") && !link.startsWith("https://") && !link.startsWith("/")) {
      return NextResponse.json({ error: "Invalid link URL" }, { status: 400 });
    }

    if (linkText && linkText.length > 200) {
      return NextResponse.json({ error: "Link text too long (max 200 chars)" }, { status: 400 });
    }

    const sortOrder = parseInt(sortOrderStr, 10);
    if (isNaN(sortOrder) || sortOrder < 0) {
      return NextResponse.json({ error: "Invalid sort order" }, { status: 400 });
    }

    const filename = `story-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    const sharp = (await import("sharp")).default;
    await sharp(buffer)
      .resize(1080, 1920, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(filepath);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        image: `/api/uploads/${filename}`,
        link,
        linkText,
        expiresAt,
        sortOrder,
      },
    });

    await logActivity({
      action: "create",
      entityType: "story",
      entityId: story.id,
      entityName: `Story #${story.id}`,
    });

    return NextResponse.json(story);
  } catch {
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}
