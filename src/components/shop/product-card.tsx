import Link from "next/link";
import Image from "next/image";
import { ImageOff, ShoppingCart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QuickViewButton } from "./quick-view-button";
import { SaleTimer } from "./sale-timer";
import { ColorSwatches } from "./color-swatches";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number | null;
    images: string | null;
    inStock: boolean;
    featured: boolean;
    salePrice: number | null;
    saleEnd: string | null;
    colorsEnabled: boolean;
    colors: string | null;
    category: { name: string; slug: string };
    brand: { name: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images?.split(",")[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            quality={85}
            unoptimized={firstImage.startsWith("/uploads/") || firstImage.startsWith("/api/uploads/")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <QuickViewButton slug={product.slug} />
        </div>
        <div className="absolute top-2 left-2 right-2 flex items-start gap-1 pointer-events-none">
          <div className="flex flex-col gap-1">
            {product.featured && <Badge variant="default">Featured</Badge>}
            {product.salePrice && product.saleEnd && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Sale
              </Badge>
            )}
          </div>
          <div className="flex-1" />
          {!product.inStock && (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <span className="text-xs text-muted-foreground">
          {product.category.name}
          {product.brand && <span className="ml-1.5 opacity-60">· {product.brand.name}</span>}
        </span>
        <h3 className="font-medium text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.price && (
          <span className="flex items-center gap-2 flex-wrap">
            {product.salePrice ? (
              <>
                <span className="text-sm font-bold text-red-400">
                  ${product.salePrice.toLocaleString("en-US")}
                </span>
                <span className="text-[11px] text-muted-foreground line-through">
                  ${product.price.toLocaleString("en-US")}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-primary">
                ${product.price.toLocaleString("en-US")}
              </span>
            )}
          </span>
        )}
        {product.saleEnd && product.salePrice && (
          <SaleTimer endDate={product.saleEnd} compact />
        )}
        {product.colorsEnabled && product.colors && (
          <ColorSwatches colors={product.colors} />
        )}
        <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
          <ShoppingCart className="h-3 w-3" />
          {product.price ? "Order via WhatsApp" : "Inquire about price via WhatsApp"}
        </div>
      </div>
    </Link>
  );
}
