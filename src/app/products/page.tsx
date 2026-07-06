import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { FadeIn } from "@/components/ui/fade-in";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata(
  props: { searchParams: Promise<{ q?: string; category?: string; brand?: string }> }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const parts: string[] = [];
  if (searchParams.category) parts.push(`in ${searchParams.category}`);
  if (searchParams.brand) parts.push(`by ${searchParams.brand}`);
  const filterDesc = parts.length > 0 ? ` ${parts.join(" ")}` : "";
  return {
    title: `Products${filterDesc}`,
    description: `Browse all car accessories products${filterDesc}. Speakers, LED lights, cameras, tint films, and more.`,
    alternates: { canonical: `${siteUrl}/products` },
  };
}

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
  }>;
}

interface ProductsPageProduct {
  id: number; name: string; slug: string; description: string | null;
  price: number | null; images: string | null; specs: string | null;
  model: string | null; inStock: boolean; featured: boolean;
  tiktokEnabled: boolean; tiktokUrl: string | null;
  guideEnabled: boolean; guideUrl: string | null; guideContent: string | null;
  salePrice: number | null; saleEnd: string | null;
  colorsEnabled: boolean; colors: string | null; status: string;
  categoryId: number; brandId: number | null;
  category: { name: string; slug: string };
  brand: { name: string } | null;
  createdAt: Date; updatedAt: Date;
  nameEn: string | null;
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q;
  const categorySlug = searchParams.category;
  const brandSlug = searchParams.brand;
  const sort = searchParams.sort || "newest";

  let products: ProductsPageProduct[] = [];
  let categories: { id: number; name: string; slug: string }[] = [];
  let brands: { id: number; name: string; slug: string }[] = [];

  try {
    const where: Record<string, unknown> = { status: "active" };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { nameEn: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (brandSlug) {
      const brand = await prisma.brand.findUnique({
        where: { slug: brandSlug },
      });
      if (brand) {
        where.brandId = brand.id;
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

    const rawProducts = await prisma.product.findMany({
      where: where as Prisma.ProductWhereInput,
      include: { category: true, brand: true },
      orderBy,
    });
    products = rawProducts.map((p) => ({ ...p, saleEnd: p.saleEnd?.toISOString() || null })) as ProductsPageProduct[];

    categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    // DB unavailable — render with empty data
  }

  return (
    <div className="container-main py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">All car accessories in one place</p>
      </div>

      <ProductFilters
        categories={categories}
        brands={brands}
        currentQ={q || undefined}
        currentCategory={categorySlug || undefined}
        currentBrand={brandSlug || undefined}
        currentSort={sort}
      />

      <div className="flex-1 min-w-0">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg mb-4">No products found</p>
            {q || categorySlug ? (
              <Link href="/products">
                <Button variant="outline" size="sm">Clear Filters</Button>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground/60">Check back later for new arrivals</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4" role="status">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <FadeIn key={product.id} delay={index * 45}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
