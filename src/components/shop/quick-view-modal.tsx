"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Music, Package, ShoppingCart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideButton } from "./guide-button";
import { ShareButtons } from "./share-buttons";
import { SaleTimer } from "./sale-timer";
import { ColorSwatches } from "./color-swatches";
import { ensureProtocol } from "@/lib/utils";

interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  images: string | null;
  specs: string | null;
  brand: { name: string } | null;
  model: string | null;
  inStock: boolean;
  featured: boolean;
  tiktokEnabled: boolean;
  tiktokUrl: string | null;
  guideEnabled: boolean;
  guideUrl: string | null;
  guideContent: string | null;
  salePrice: number | null;
  saleStart: string | null;
  saleEnd: string | null;
  colorsEnabled: boolean;
  colors: string | null;
  category: { name: string; slug: string };
  whatsappUrl?: string;
}

interface QuickViewModalProps {
  slug: string | null;
  onClose: () => void;
}

export function QuickViewModal({ slug, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      return;
    }
    setLoading(true);
    setSelectedImage(0);
    fetch(`/api/products/by-slug/${slug}`)
      .then((r) => r.json())
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!slug) return;
      if (e.key === "Escape") onClose();
    },
    [slug, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (slug) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [slug]);

  const imageList = product?.images
    ? product.images.split(",").map((u: string) => u.trim()).filter(Boolean)
    : [];

  let specs: Record<string, string> = {};
  if (product?.specs) {
    try { specs = JSON.parse(product.specs); } catch {}
  }

  if (!slug) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !product ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Package className="h-12 w-12 opacity-30" />
            <p className="text-sm">Product not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative bg-secondary/30">
              {imageList.length > 0 ? (
                <div className="sticky top-0">
                  <div className="relative aspect-square">
                    <Image
                      src={imageList[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={85}
                      priority
                      unoptimized={imageList[selectedImage].startsWith("/uploads/") || imageList[selectedImage].startsWith("/api/uploads/")}
                    />
                    {imageList.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((p) => (p - 1 + imageList.length) % imageList.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedImage((p) => (p + 1) % imageList.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {imageList.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {imageList.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`relative shrink-0 w-14 h-14 rounded-lg border overflow-hidden bg-secondary transition-all ${
                            i === selectedImage ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Image src={img} alt={product?.name ? `${product.name} thumbnail` : "Product image"} fill className="object-cover" sizes="56px" quality={85} unoptimized={img.startsWith("/uploads/") || img.startsWith("/api/uploads/")} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center text-muted-foreground">
                  <Package className="h-12 w-12 opacity-30" />
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground">{product.category.name}</span>
                  <h2 className="text-lg font-bold leading-tight mt-0.5">{product.name}</h2>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!product.inStock && <Badge variant="destructive">Out of Stock</Badge>}
                  {product.featured && <Badge variant="default">Featured</Badge>}
                </div>
              </div>

              {product.price && (
                <div className="flex items-center gap-2 flex-wrap">
                  {product.salePrice ? (
                    <>
                      <div className="text-2xl font-bold text-red-400">
                        ${product.salePrice.toLocaleString("en-US")}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        ${product.price.toLocaleString("en-US")}
                      </div>
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Sale
                      </Badge>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      ${product.price.toLocaleString("en-US")}
                    </div>
                  )}
                </div>
              )}
              {product.saleEnd && product.salePrice && (
                <SaleTimer endDate={product.saleEnd} />
              )}

              {product.colorsEnabled && product.colors && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Available Colors</span>
                  <ColorSwatches colors={product.colors} size="md" />
                </div>
              )}

              {product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {(product.brand || product.model) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {product.brand && (
                    <span><span className="text-muted-foreground">Brand: </span>{product.brand.name}</span>
                  )}
                  {product.model && (
                    <span><span className="text-muted-foreground">Model: </span>{product.model}</span>
                  )}
                </div>
              )}

              {Object.keys(specs).length > 0 && (
                <div className="rounded-lg border border-border p-3 space-y-1.5">
                  <h3 className="text-xs font-semibold">Specifications</h3>
                  {Object.entries(specs).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs py-0.5 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{key}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                  {Object.keys(specs).length > 4 && (
                    <Link href={`/products/${product.slug}`} onClick={onClose} className="text-xs text-primary hover:underline block mt-1">
                      View all specs
                    </Link>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto pt-2">
                <Link href={`/products/${product.slug}`} onClick={onClose}>
                  <Button size="sm" className="w-full gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    View Full Details
                  </Button>
                </Link>
                {product.guideEnabled && (
                  <GuideButton
                    url={product.guideUrl}
                    content={product.guideContent}
                    productName={product.name}
                    size="sm"
                  />
                )}
                {product.tiktokEnabled && product.tiktokUrl && (
                  <Link href={ensureProtocol(product.tiktokUrl)} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Music className="h-4 w-4" />
                      Watch on TikTok
                    </Button>
                  </Link>
                )}

                <ShareButtons
                  productName={product.name}
                  productUrl={`${window.location.origin}/products/${product.slug}`}
                  price={product.price}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
