"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  currentQ?: string;
  currentCategory?: string;
  currentBrand?: string;
  currentSort: string;
}

export function ProductFilters({ categories, brands, currentQ, currentCategory, currentBrand, currentSort }: ProductFiltersProps) {
  const router = useRouter();

  function navigate(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const q = params.q ?? currentQ;
    const cat = params.category ?? currentCategory;
    const brand = params.brand ?? currentBrand;
    const sort = params.sort ?? currentSort;
    if (q) sp.set("q", q);
    if (cat) sp.set("category", cat);
    if (brand) sp.set("brand", brand);
    if (sort && sort !== "newest") sp.set("sort", sort);
    const qs = sp.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          navigate({ q: fd.get("q") as string || undefined });
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          name="q"
          defaultValue={currentQ || ""}
          placeholder="Search products..."
          className="pl-9"
          onBlur={(e) => {
            const val = e.target.value || undefined;
            if (val !== currentQ) navigate({ q: val });
          }}
        />
      </form>

      <Select
        value={currentCategory || ""}
        onValueChange={(val) => navigate({ category: val || undefined })}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentBrand || ""}
        onValueChange={(val) => navigate({ brand: val || undefined })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Brands" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.slug}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSort}
        onValueChange={(val) => navigate({ sort: val })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
