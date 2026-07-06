import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <ProductForm
      categories={categories}
      brands={brands}
      initialData={{
        id: product.id,
        name: product.name,
        nameEn: product.nameEn || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        images: product.images || "",
        specs: product.specs || "",
        brandId: product.brandId?.toString() || "",
        model: product.model || "",
        inStock: product.inStock,
        featured: product.featured,
        tiktokEnabled: product.tiktokEnabled,
        tiktokUrl: product.tiktokUrl || "",
        guideEnabled: product.guideEnabled,
        guideUrl: product.guideUrl || "",
        guideContent: product.guideContent || "",
        salePrice: product.salePrice?.toString() || "",
        saleStart: product.saleStart ? product.saleStart.toISOString().slice(0, 16) : "",
        saleEnd: product.saleEnd ? product.saleEnd.toISOString().slice(0, 16) : "",
        colorsEnabled: product.colorsEnabled,
        colors: product.colors || "",
        categoryId: product.categoryId.toString(),
      }}
    />
  );
}
