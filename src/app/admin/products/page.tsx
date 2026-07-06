"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Package, EyeOff, Eye, Trash2, AlertTriangle } from "lucide-react";

interface Product {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  price: number | null;
  inStock: boolean;
  featured: boolean;
  status: string;
  category: { name: string };
  brand: { name: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products?all=true");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else throw new Error("Invalid response");
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function toggleStatus(product: Product) {
    const newStatus = product.status === "draft" ? "active" : "draft";
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
    }
  }

  async function permanentDelete(id: number) {
    const res = await fetch(`/api/products/${id}?permanent=true`, { method: "DELETE" });
    if (res.ok) {
      setConfirmDelete(null);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage {products.length} products
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-30" />
          <p className="text-muted-foreground">No products yet</p>
          <Link href="/admin/products/new">
            <Button variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add your first product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Product Name</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Brand</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Price</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3">
                    <div>
                      <span className={`text-sm font-medium ${product.status === "draft" ? "text-muted-foreground line-through" : ""}`}>
                        {product.name}
                      </span>
                      {product.nameEn && (
                        <span className="text-xs text-muted-foreground block">{product.nameEn}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{product.category.name}</td>
                  <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{product.brand?.name || "—"}</td>
                  <td className="p-3 text-sm hidden sm:table-cell">
                    {product.price ? `$${product.price.toLocaleString("en-US")}` : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {product.status === "draft" ? (
                        <Badge variant="outline" className="text-muted-foreground border-dashed">Draft</Badge>
                      ) : (
                        <>
                          {product.inStock ? (
                            <Badge variant="success">In Stock</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </>
                      )}
                      {product.featured && product.status !== "draft" && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(product)}
                        title={product.status === "draft" ? "Activate" : "Deactivate"}
                      >
                        {product.status === "draft" ? (
                          <Eye className="h-4 w-4 text-green-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-amber-400" />
                        )}
                      </Button>
                      {confirmDelete === product.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => permanentDelete(product.id)}
                            title="Confirm permanent delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDelete(product.id)}
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Permanently Delete?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone. The product will be removed from the database and all URLs will return 404.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => permanentDelete(confirmDelete)}>Delete Forever</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
