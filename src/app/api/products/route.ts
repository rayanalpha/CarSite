import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, toNum, toNullOrUndefined, uniqueSlug } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";
import { requireApiAuth, unauthorized } from "@/lib/auth";
import { ProductSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const showAll = url.searchParams.get("all") === "true";

  let where = {};
  if (!showAll) {
    where = { status: "active" };
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
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

    if (parsed.data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const slug = await uniqueSlug(slugify(parsed.data.name), async (s) => {
      const existing = await prisma.product.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const product = await prisma.product.create({
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
        categoryId: parsed.data.categoryId,
      },
    });

    logActivity({
      action: "create",
      entityType: "product",
      entityId: product.id,
      entityName: product.name,
      details: JSON.stringify({ price: product.price }),
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
