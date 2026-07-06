import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ArrowLeft, Package, Truck, Music, Clock, EyeOff } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { SaleTimer } from "@/components/shop/sale-timer";
import { ColorSwatches } from "@/components/shop/color-swatches";
import { ProductCard } from "@/components/shop/product-card";
import { ImageGallery } from "@/components/shop/image-gallery";
import { GuideButton } from "@/components/shop/guide-button";
import { ShareButtons } from "@/components/shop/share-buttons";
import { ensureProtocol } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, brand: true },
  });

  if (!product) return {};

  const firstImage = product.images?.split(",")[0]?.trim();
  const isDraft = product.status === "draft";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: isDraft ? `${product.name} (Unavailable)` : product.name,
    description: isDraft ? "This product is no longer available" : (product.description || `Buy ${product.name} at MotorPro`),
    robots: isDraft ? { index: false, follow: false } : undefined,
    alternates: { canonical: `${siteUrl}/products/${params.slug}` },
    openGraph: {
      title: isDraft ? `${product.name} (Unavailable)` : product.name,
      description: isDraft ? "This product is no longer available" : (product.description || ""),
      url: `${siteUrl}/products/${params.slug}`,
      images: firstImage ? [{ url: firstImage }] : [],
    },
  };
}

export default async function ProductDetailPage(props: ProductPageProps) {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, brand: true },
  });

  if (!product || product.status === "draft") notFound();

  const isDraft = product.status === "draft";
  const settings = await getSettings();

  const rawRelated = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "active",
    },
    include: { category: true, brand: true },
    take: 4,
  });
  const relatedProducts = rawRelated.map((p) => ({ ...p, saleEnd: p.saleEnd?.toISOString() || null }));

  const images = product.images ? product.images.split(",").map((u) => u.trim()).filter(Boolean) : [];
  let specs: Record<string, string> = {};
  if (product.specs) {
    try { specs = JSON.parse(product.specs); } catch {}
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} at MotorPro`,
    image: images.length > 0 ? images : undefined,
    url: productUrl,
    category: product.category.name,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      price: product.salePrice || product.price || 0,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  return (
    <div className="container-main py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      {isDraft && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
            <EyeOff className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-400">This product is no longer available</p>
            <p className="text-xs text-muted-foreground mt-0.5">The seller has removed this listing. The page is kept for reference only.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <ImageGallery images={images} productName={product.name} />

        <div className="space-y-6">
          <div>
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {product.name}
            </h1>
            {product.nameEn && (
              <p className="text-sm text-muted-foreground mt-1">{product.nameEn}</p>
            )}
          </div>

          {product.price && (
            <div className="flex items-center gap-3 flex-wrap">
              {product.salePrice ? (
                <>
                  <div className="text-3xl font-bold text-red-400">
                    ${product.salePrice.toLocaleString("en-US")}
                  </div>
                  <div className="text-lg text-muted-foreground line-through">
                    ${product.price.toLocaleString("en-US")}
                  </div>
                  {product.saleStart && new Date(product.saleStart) > new Date() ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Upcoming
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Sale
                    </Badge>
                  )}
                </>
              ) : (
                <div className="text-3xl font-bold text-primary">
                  ${product.price.toLocaleString("en-US")}
                </div>
              )}
            </div>
          )}
          {product.saleEnd && product.salePrice && (
            <SaleTimer endDate={product.saleEnd.toISOString()} />
          )}

          {product.colorsEnabled && product.colors && (
            <div>
              <span className="text-sm text-muted-foreground block mb-2">Available Colors</span>
              <ColorSwatches colors={product.colors} size="md" />
            </div>
          )}

          <div className="flex items-center gap-2">
            {product.inStock ? (
              <Badge variant="success">
                <Package className="h-3 w-3 mr-1" />
                In Stock
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {product.brand && (
              <div className="text-sm">
                <span className="text-muted-foreground">Brand: </span>
                {product.brand.name}
              </div>
            )}
            {product.model && (
              <div className="text-sm mr-4">
                <span className="text-muted-foreground">Model: </span>
                {product.model}
              </div>
            )}
          </div>

          {Object.keys(specs).length > 0 && (
            <div className="rounded-xl border border-border p-4 space-y-2">
              <h3 className="text-sm font-semibold mb-3">Specifications</h3>
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{key}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {product.guideEnabled && (
            <GuideButton
              url={product.guideUrl}
              content={product.guideContent}
              productName={product.name}
            />
          )}

          {!isDraft && product.tiktokEnabled && product.tiktokUrl && (
            <Link href={ensureProtocol(product.tiktokUrl)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full gap-2">
                <Music className="h-5 w-5" />
                Watch on TikTok
              </Button>
            </Link>
          )}

          {!isDraft && (
            <Link
              href={ensureProtocol(settings.socials.find((s) => s.platform === "whatsapp")?.url || "#")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="w-full gap-2">
                <MessageCircle className="h-5 w-5" />
                {product.price ? "Order via WhatsApp" : "Inquire about price via WhatsApp"}
              </Button>
            </Link>
          )}

          {!isDraft && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-4 w-4" />
              Nationwide shipping available
            </div>
          )}

          <ShareButtons
            productName={product.name}
            productUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products/${product.slug}`}
            productImage={images[0] || undefined}
            price={product.price}
          />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p, index) => (
              <FadeIn key={p.id} delay={index * 80}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
