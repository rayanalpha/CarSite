import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import fs from "fs/promises";
import path from "path";
import { requireApiAuth, unauthorized } from "@/lib/auth";
import { StoryUpdateSchema, isValidId } from "@/lib/validation";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    await prisma.story.delete({ where: { id } });

    const resolvedPath = path.resolve(path.join(process.cwd(), "public", story.image));
    const uploadsDir = path.resolve(path.join(process.cwd(), "public", "uploads"));
    if (resolvedPath.startsWith(uploadsDir)) {
      try { await fs.unlink(resolvedPath); } catch { /* ignore */ }
    }

    await logActivity({
      action: "delete",
      entityType: "story",
      entityId: story.id,
      entityName: `Story #${story.id}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = StoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.story.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const story = await prisma.story.update({
      where: { id },
      data: {
        ...(parsed.data.link !== undefined && { link: parsed.data.link }),
        ...(parsed.data.linkText !== undefined && { linkText: parsed.data.linkText }),
        ...(parsed.data.expiresAt !== undefined && { expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null }),
        ...(parsed.data.sortOrder !== undefined && { sortOrder: parsed.data.sortOrder }),
      },
    });

    await logActivity({
      action: "update",
      entityType: "story",
      entityId: story.id,
      entityName: `Story #${story.id}`,
    });

    return NextResponse.json(story);
  } catch {
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}
