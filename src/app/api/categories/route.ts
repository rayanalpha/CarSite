import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";
import { requireApiAuth, unauthorized } from "@/lib/auth";
import { CategorySchema, isValidId } from "@/lib/validation";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    const data = await request.json();
    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (parsed.data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }
    }

    const slug = await uniqueSlug(slugify(parsed.data.name), async (s) => {
      const existing = await prisma.category.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || "",
        slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
        parentId: parsed.data.parentId ?? null,
      },
    });

    logActivity({
      action: "create",
      entityType: "category",
      entityId: category.id,
      entityName: category.name,
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    const data = await request.json();
    const id = parseInt(data.id, 10);
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (parsed.data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }
    }

    const baseSlug = slugify(parsed.data.name);
    const slug = baseSlug === existing.slug
      ? existing.slug
      : await uniqueSlug(baseSlug, async (s) => {
          const other = await prisma.category.findUnique({ where: { slug: s } });
          return !!other;
        });

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || "",
        slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
        parentId: parsed.data.parentId ?? null,
      },
    });

    logActivity({
      action: "update",
      entityType: "category",
      entityId: category.id,
      entityName: category.name,
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");
    if (!idStr) return NextResponse.json({ error: "id required" }, { status: 400 });

    const id = parseInt(idStr, 10);
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json({ error: `Category has ${productCount} products. Remove them first.` }, { status: 400 });
    }

    const childCount = await prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return NextResponse.json({ error: `Category has ${childCount} subcategories. Remove them first.` }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    logActivity({
      action: "delete",
      entityType: "category",
      entityId: id,
      entityName: existing.name,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
