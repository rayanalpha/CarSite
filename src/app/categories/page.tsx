import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Car, ArrowLeft } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: "Categories",
    description: "Browse all car accessories categories — speakers, LED lights, cameras, tint films, dash cameras, and Android CarPlay.",
    alternates: { canonical: `${siteUrl}/categories` },
  };
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container-main py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">Browse car accessories by category</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="text-muted-foreground group-hover:text-primary transition-colors">
                    {cat.image ? (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-border overflow-hidden">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <Car className="h-10 w-10" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {cat.name}
                    </h2>
                    {cat.nameEn && (
                      <p className="text-xs text-muted-foreground">{cat.nameEn}</p>
                    )}
                    {cat.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                    {cat._count.products}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-primary gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View Products
                <ArrowLeft className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
