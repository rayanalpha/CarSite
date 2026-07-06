import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

const t = {
  title: "Categories",
  desc: "Manage product categories",
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground text-sm">{t.desc}</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
