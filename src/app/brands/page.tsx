import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: "Brands",
    description: "Browse all car brands available at MotorPro. Find products by your favorite brand.",
    alternates: { canonical: `${siteUrl}/brands` },
  };
}

interface BrandsPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function getBrands(search?: string) {
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { nameEn: { contains: search } },
          ],
        }
      : {};
    return await prisma.brand.findMany({
      where,
      include: { _count: { select: { products: { where: { status: "active" } } } } },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function BrandsPage(props: BrandsPageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q;
  const brands = await getBrands(q);

  return (
    <div className="container-main py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Brands</h1>
        <p className="text-muted-foreground">Browse car accessories by brand</p>
      </div>

      <form
        className="relative max-w-md mb-8"
        action="/brands"
        method="GET"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          name="q"
          defaultValue={q || ""}
          placeholder="Search brands..."
          className="pl-9"
        />
      </form>

      {brands.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            {q ? `No brands matching "${q}"` : "No brands yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/[0.02] group-hover:to-primary/[0.06] transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white dark:bg-gray-900 p-1.5 transition-all duration-300 group-hover:scale-110">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-bold text-lg text-primary">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                    {brand.nameEn && brand.nameEn !== brand.name && (
                      <p className="text-xs text-muted-foreground">{brand.nameEn}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/50" />
                  {brand._count.products} product{brand._count.products !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
