import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Package,
  FolderTree,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Music,
  Tags,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StatsResult = {
  productCount: number;
  categoryCount: number;
  featuredCount: number;
  outOfStockCount: number;
  inStockCount: number;
  tiktokCount: number;
  brandCount: number;
  recentProducts: {
    id: number;
    name: string;
    price: number | null;
    inStock: boolean;
    featured: boolean;
    tiktokEnabled: boolean;
    category: { id: number; name: string; slug: string };
  }[];
  categoryList: {
    id: number;
    name: string;
    slug: string;
    _count: { products: number };
  }[];
};

async function getStats(): Promise<StatsResult> {
  try {
    const [
      productCount,
      categoryCount,
      featuredCount,
      outOfStockCount,
      inStockCount,
      tiktokCount,
      brandCount,
      recentProducts,
      categoryList,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { inStock: false } }),
      prisma.product.count({ where: { inStock: true } }),
      prisma.product.count({ where: { tiktokEnabled: true } }),
      prisma.brand.count(),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }),
      prisma.category.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { products: true } } },
      }),
    ]);
    return {
      productCount,
      categoryCount,
      featuredCount,
      outOfStockCount,
      inStockCount,
      tiktokCount,
      brandCount,
      recentProducts,
      categoryList,
    };
  } catch {
    return {
      productCount: 0,
      categoryCount: 0,
      featuredCount: 0,
      outOfStockCount: 0,
      inStockCount: 0,
      tiktokCount: 0,
      brandCount: 0,
      recentProducts: [],
      categoryList: [],
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      title: "Products",
      value: stats.productCount,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/admin/products",
    },
    {
      title: "Categories",
      value: stats.categoryCount,
      icon: FolderTree,
      color: "text-accent",
      bg: "bg-accent/10",
      href: "/admin/categories",
    },
    {
      title: "Brands",
      value: stats.brandCount,
      icon: Tags,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      title: "Featured",
      value: stats.featuredCount,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "In Stock",
      value: stats.inStockCount,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockCount,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "TikTok Posts",
      value: stats.tiktokCount,
      icon: Music,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Store overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div
              className={`rounded-xl border border-border bg-card p-5 ${
                card.href ? "hover:border-primary/30 transition-colors cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.title}</span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          );
          if (card.href) {
            return <Link key={card.title} href={card.href}>{content}</Link>;
          }
          return <div key={card.title}>{content}</div>;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Products</h2>
            <Link
              href="/admin/products"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.recentProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.category.name}
                      {p.price && ` — $${p.price.toLocaleString("en-US")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!p.inStock && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        OOS
                      </Badge>
                    )}
                    {p.featured && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Categories</h2>
            <Link
              href="/admin/categories"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.categoryList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryList.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {cat._count?.products || 0} products
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
