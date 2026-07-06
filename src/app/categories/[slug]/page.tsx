import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { FadeIn } from "@/components/ui/fade-in";
import { ArrowLeft, PackageOpen } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  if (!category) return {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: category.name,
    description: category.description || `${category.name} — car accessories products`,
    alternates: { canonical: `${siteUrl}/categories/${params.slug}` },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: "active" },
        include: { category: true, brand: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="container-main py-8">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Categories
      </Link>

      <div className="mb-8 flex items-start gap-4">
        {category.image ? (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-border overflow-hidden">
            <img src={category.image} alt={category.name} className="w-full h-full object-contain" />
          </div>
        ) : null}
        <div>
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {category.products.length} product{category.products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {category.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PackageOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg">No products in this category yet</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Check back later for new arrivals</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {category.products.map((product, index) => (
            <FadeIn key={product.id} delay={index * 45}>
              <ProductCard product={{ ...product, saleEnd: product.saleEnd?.toISOString() || null }} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
