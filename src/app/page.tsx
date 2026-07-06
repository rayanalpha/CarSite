import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/shop/product-card";
import { FadeIn } from "@/components/ui/fade-in";
import { HeroSlider } from "@/components/shop/hero-slider";
import { ensureProtocol } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: `${settings.storeName} | Premium Car Accessories & Auto Parts Store`,
    description:
      "Premium car accessories store. Speakers, interior decorations, lighting, rims, and all automotive accessories with top quality.",
    keywords: [
      "car accessories",
      "car speakers",
      "auto parts",
      "car interior",
      "car audio system",
      "automotive accessories",
      "car dashboard",
      "LED lights car",
      "car tint film",
      "car camera",
    ],
    alternates: { canonical: siteUrl },
    openGraph: {
      title: `${settings.storeName} | Premium Car Accessories & Auto Parts Store`,
      description:
        "Premium car accessories store. Speakers, interior decorations, lighting, rims, and more.",
      url: siteUrl,
      siteName: settings.storeName,
      images: settings.siteIcon ? [{ url: settings.siteIcon }] : [],
    },
  };
}

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, status: "active" },
      include: { category: true, brand: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => ({ ...p, saleEnd: p.saleEnd?.toISOString() || null }));
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      take: 6,
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

async function getBrands() {
  try {
    return await prisma.brand.findMany({
      include: { _count: { select: { products: { where: { status: "active" } } } } },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, categories, brands, settings] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getBrands(),
    getSettings(),
  ]);

  return (
    <>
      {settings.heroEnabled && (
        <section className="relative overflow-hidden min-h-[70vh] md:min-h-[80vh]">
          <HeroSlider
            brands={brands}
            interval={settings.heroSliderInterval}
            autoPlay={settings.heroAutoPlay}
            allBrandsHeading={settings.heroAllBrandsHeading}
            allBrandsDescription={settings.heroAllBrandsDescription}
          />
        </section>
      )}

      {categories.length > 0 && (
        <section className="container-main py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Categories</h2>
              <Link
                href="/categories"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                All Categories
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  {cat.image ? (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-border overflow-hidden">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <Car className="h-10 w-10" />
                  )}
                </div>
                <span className="text-sm font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="container-main py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Shop by Brand</h2>
            <Link
              href="/brands"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              All Brands
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brands.slice(0, 6).map((brand, index) => (
              <FadeIn key={brand.id} delay={index * 80}>
                <Link
                  href={`/products?brand=${brand.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 block"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/[0.02] group-hover:to-primary/[0.06] transition-all duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white dark:bg-gray-900 p-1.5 transition-all duration-300 group-hover:scale-110">
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
              </FadeIn>
            ))}
            {brands.length > 6 && (
              <FadeIn delay={6 * 80}>
                <Link
                  href="/brands"
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 block"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-primary/10 group-hover:from-primary/10 group-hover:to-primary/15 transition-all duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 p-2 transition-all duration-300 group-hover:scale-110">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-primary">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                          All Brands
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {brands.length - 6} more brand{brands.length - 6 !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                      <ArrowRight className="h-3.5 w-3.5" />
                      Browse all brands
                    </p>
                  </div>
                </Link>
              </FadeIn>
            )}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="container-main py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link
              href="/products"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              All Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featuredProducts.map((product, index) => (
              <FadeIn key={product.id} delay={index * 45}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      <section className="container-main py-16">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Order?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Contact us directly on WhatsApp for free consultation, pricing, and orders.
            </p>
            <Link
              href={ensureProtocol(settings.socials.find((s) => s.platform === "whatsapp")?.url || "#")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Order via WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
