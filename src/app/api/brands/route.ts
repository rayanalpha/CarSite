import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";
import { requireApiAuth, unauthorized } from "@/lib/auth";
import { BrandSchema } from "@/lib/validation";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(brands);
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    const data = await request.json();
    const parsed = BrandSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const slug = await uniqueSlug(slugify(parsed.data.name), async (s) => {
      const existing = await prisma.brand.findUnique({ where: { slug: s } });
      return !!existing;
    });
    const brand = await prisma.brand.create({
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || "",
        slug,
        logo: parsed.data.logo || null,
        heroImage: parsed.data.heroImage || null,
        heroDescription: parsed.data.heroDescription || null,
      },
    });

    logActivity({
      action: "create",
      entityType: "brand",
      entityId: brand.id,
      entityName: brand.name,
    });

    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
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
    if (!id || id < 1) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const parsed = BrandSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const baseSlug = slugify(parsed.data.name);
    const slug = baseSlug === existing.slug
      ? existing.slug
      : await uniqueSlug(baseSlug, async (s) => {
          const other = await prisma.brand.findUnique({ where: { slug: s } });
          return !!other;
        });
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || "",
        slug,
        logo: parsed.data.logo !== undefined ? parsed.data.logo : existing.logo,
        heroImage: parsed.data.heroImage !== undefined ? parsed.data.heroImage : existing.heroImage,
        heroDescription: parsed.data.heroDescription !== undefined ? parsed.data.heroDescription : existing.heroDescription,
      },
    });

    logActivity({
      action: "update",
      entityType: "brand",
      entityId: brand.id,
      entityName: brand.name,
    });

    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
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
    if (!id || id < 1) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      return NextResponse.json({ error: `Brand has ${productCount} products. Remove them first.` }, { status: 400 });
    }

    await prisma.brand.delete({ where: { id } });

    logActivity({
      action: "delete",
      entityType: "brand",
      entityId: id,
      entityName: existing.name,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
