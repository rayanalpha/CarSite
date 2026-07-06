import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  return <ProductForm categories={categories} brands={brands} />;
}
