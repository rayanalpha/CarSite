import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, toNum, toNullOrUndefined, uniqueSlug } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";
import { requireApiAuth, unauthorized, checkOrigin } from "@/lib/auth";
import { ProductSchema, isValidId } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
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

    const data = await request.json();

    const parsed = ProductSchema.safeParse({
      ...data,
      nameEn: toNullOrUndefined(data.nameEn),
      description: toNullOrUndefined(data.description),
      price: toNum(data.price),
      images: toNullOrUndefined(data.images),
      specs: toNullOrUndefined(data.specs),
      brandId: data.brandId ? Number(data.brandId) : undefined,
      model: toNullOrUndefined(data.model),
      tiktokUrl: toNullOrUndefined(data.tiktokUrl),
      guideUrl: toNullOrUndefined(data.guideUrl),
      guideContent: toNullOrUndefined(data.guideContent),
      salePrice: toNum(data.salePrice),
      saleStart: toNullOrUndefined(data.saleStart),
      saleEnd: toNullOrUndefined(data.saleEnd),
      colors: toNullOrUndefined(data.colors),
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (parsed.data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!cat) {
        return NextResponse.json({ error: "Category not found" }, { status: 400 });
      }
    }

    const baseSlug = slugify(parsed.data.name);
    const slug = baseSlug === existing.slug
      ? existing.slug
      : await uniqueSlug(baseSlug, async (s) => {
          const other = await prisma.product.findUnique({ where: { slug: s } });
          return !!other;
        });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || null,
        slug,
        description: parsed.data.description || null,
        price: parsed.data.price ?? null,
        images: parsed.data.images || null,
        specs: parsed.data.specs || null,
        brandId: parsed.data.brandId ?? null,
        model: parsed.data.model || null,
        inStock: parsed.data.inStock ?? true,
        featured: parsed.data.featured ?? false,
        tiktokEnabled: parsed.data.tiktokEnabled ?? false,
        tiktokUrl: parsed.data.tiktokUrl || null,
        guideEnabled: parsed.data.guideEnabled ?? false,
        guideUrl: parsed.data.guideUrl || null,
        guideContent: parsed.data.guideContent || null,
        salePrice: parsed.data.salePrice ?? null,
        saleStart: parsed.data.saleStart ? new Date(parsed.data.saleStart) : null,
        saleEnd: parsed.data.saleEnd ? new Date(parsed.data.saleEnd) : null,
        colorsEnabled: parsed.data.colorsEnabled ?? false,
        colors: parsed.data.colors || null,
        status: parsed.data.status || "active",
        categoryId: parsed.data.categoryId,
      },
    });

    logActivity({
      action: "update",
      entityType: "product",
      entityId: product.id,
      entityName: product.name,
      details: JSON.stringify({ price: product.price }),
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
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

    const { status } = await request.json();

    if (!["active", "draft"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status },
    });

    logActivity({
      action: status === "draft" ? "deactivate" : "activate",
      entityType: "product",
      entityId: product.id,
      entityName: product.name,
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
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

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await prisma.product.delete({ where: { id } });
      logActivity({
        action: "permanent_delete",
        entityType: "product",
        entityId: product.id,
        entityName: product.name,
      });
      return NextResponse.json({ success: true, permanent: true });
    }

    await prisma.product.update({
      where: { id },
      data: { status: "draft" },
    });

    logActivity({
      action: "deactivate",
      entityType: "product",
      entityId: product.id,
      entityName: product.name,
    });

    return NextResponse.json({ success: true, status: "draft" });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
