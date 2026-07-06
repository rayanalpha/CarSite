"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Save, ArrowLeft, Loader2, Music, BookOpen, Clock, Palette } from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  brands: Brand[];
  initialData?: {
    id?: number;
    name: string;
    nameEn: string;
    description: string;
    price: string;
    images: string;
    specs: string;
    brandId: string;
    model: string;
    inStock: boolean;
    featured: boolean;
    tiktokEnabled: boolean;
    tiktokUrl: string;
    guideEnabled: boolean;
    guideUrl: string;
    guideContent: string;
    salePrice: string;
    saleStart: string;
    saleEnd: string;
    colorsEnabled: boolean;
    colors: string;
    categoryId: string;
  };
}

const labels = {
  create: "Create Product",
  edit: "Edit Product",
  createDesc: "Add a new product",
  editDesc: "Edit product details",
  save: "Save Changes",
  createAction: "Create Product",
  name: "Product Name",
  nameEn: "Product Name (English)",
  description: "Description",
  price: "Price (USD)",
  category: "Category",
  brand: "Brand",
  model: "Vehicle Model",
  images: "Product Images",
  specs: "Specifications (JSON)",
  inStock: "In Stock",
  featured: "Featured Product",
  tiktok: "TikTok Post",
  tiktokDesc: "If there is a TikTok video for this product, enable and paste the link below.",
  tiktokUrl: "TikTok Video URL",
  guide: "Installation Guide",
  guideDesc: "Add a link (YouTube, article) and/or written instructions for installing this product.",
  guideUrl: "Guide URL (optional)",
  guideContent: "Guide Instructions (optional)",
  sale: "Sale / Discount",
  saleDesc: "Set a discounted price with an optional countdown timer.",
  salePrice: "Sale Price (USD)",
  saleStart: "Sale Start",
  saleEnd: "Sale End",
  colors: "Available Colors",
  colorsDesc: "Add hex color codes for the available color options of this product (e.g. #FF0000).",
  colorsAdd: "Add Color",
  colorsPlaceholder: "#FF0000",
};

export function ProductForm({ categories, brands, initialData }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newColor, setNewColor] = useState("#FF0000");
  const [form, setForm] = useState({
    name: initialData?.name || "",
    nameEn: initialData?.nameEn || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    images: initialData?.images || "",
    specs: initialData?.specs || "",
    brandId: initialData?.brandId || "",
    model: initialData?.model || "",
    inStock: initialData?.inStock ?? true,
    featured: initialData?.featured ?? false,
    tiktokEnabled: initialData?.tiktokEnabled ?? false,
    tiktokUrl: initialData?.tiktokUrl || "",
    guideEnabled: initialData?.guideEnabled ?? false,
    guideUrl: initialData?.guideUrl || "",
    guideContent: initialData?.guideContent || "",
    salePrice: initialData?.salePrice || "",
    saleStart: initialData?.saleStart || "",
    saleEnd: initialData?.saleEnd || "",
    colorsEnabled: initialData?.colorsEnabled ?? false,
    colors: initialData?.colors || "",
    categoryId: initialData?.categoryId || (categories[0]?.id.toString() || ""),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = initialData?.id
      ? `/api/products/${initialData.id}`
      : "/api/products";
    const method = initialData?.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        window.location.href = "/admin/products";
      } else {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        if (typeof data.error === "string") {
          setError(data.error);
        } else if (typeof data.error === "object") {
          setError(Object.entries(data.error).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; "));
        } else {
          setError("Failed to save product");
        }
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {initialData ? labels.edit : labels.create}
            </h1>
            <p className="text-sm text-muted-foreground">
              {initialData ? labels.editDesc : labels.createDesc}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {initialData ? labels.save : labels.createAction}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{labels.name}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameEn">{labels.nameEn}</Label>
            <Input
              id="nameEn"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{labels.description}</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">{labels.price}</Label>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">{labels.category}</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brandId">{labels.brand}</Label>
            <Select
              value={form.brandId}
              onValueChange={(v) => setForm({ ...form, brandId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No brand</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">{labels.model}</Label>
            <Input
              id="model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{labels.images}</Label>
          <ImageUpload
            value={form.images}
            onChange={(value) => setForm({ ...form, images: value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specs">{labels.specs}</Label>
          <Textarea
            id="specs"
            value={form.specs}
            onChange={(e) => setForm({ ...form, specs: e.target.value })}
            placeholder='{"Power": "100W", "Frequency": "20Hz-20kHz"}'
            rows={3}
            dir="ltr"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
              className="rounded border-border bg-background"
            />
            <span className="text-sm">{labels.inStock}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded border-border bg-background"
            />
            <span className="text-sm">{labels.featured}</span>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Music className="h-4 w-4" />
          {labels.tiktok}
        </h2>
        <p className="text-xs text-muted-foreground">{labels.tiktokDesc}</p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.tiktokEnabled}
            onChange={(e) => setForm({ ...form, tiktokEnabled: e.target.checked })}
            className="rounded border-border bg-background"
          />
          <span className="text-sm">Enable TikTok link for this product</span>
        </label>

        {form.tiktokEnabled && (
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">{labels.tiktokUrl}</Label>
            <Input
              id="tiktokUrl"
              value={form.tiktokUrl}
              onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
              placeholder="https://www.tiktok.com/@username/video/123456789"
              dir="ltr"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {labels.guide}
        </h2>
        <p className="text-xs text-muted-foreground">{labels.guideDesc}</p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.guideEnabled}
            onChange={(e) => setForm({ ...form, guideEnabled: e.target.checked })}
            className="rounded border-border bg-background"
          />
          <span className="text-sm">Enable installation guide for this product</span>
        </label>

        {form.guideEnabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="guideUrl">{labels.guideUrl}</Label>
              <Input
                id="guideUrl"
                value={form.guideUrl}
                onChange={(e) => setForm({ ...form, guideUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guideContent">{labels.guideContent}</Label>
              <Textarea
                id="guideContent"
                value={form.guideContent}
                onChange={(e) => setForm({ ...form, guideContent: e.target.value })}
                placeholder="Step-by-step instructions for installation..."
                rows={5}
              />
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {labels.sale}
        </h2>
        <p className="text-xs text-muted-foreground">{labels.saleDesc}</p>

        <div className="space-y-2">
          <Label htmlFor="salePrice">{labels.salePrice}</Label>
          <Input
            id="salePrice"
            type="number"
            value={form.salePrice}
            onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            placeholder="149.99"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="saleStart">{labels.saleStart}</Label>
            <Input
              id="saleStart"
              type="datetime-local"
              value={form.saleStart}
              onChange={(e) => setForm({ ...form, saleStart: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saleEnd">{labels.saleEnd}</Label>
            <Input
              id="saleEnd"
              type="datetime-local"
              value={form.saleEnd}
              onChange={(e) => setForm({ ...form, saleEnd: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          {labels.colors}
        </h2>
        <p className="text-xs text-muted-foreground">{labels.colorsDesc}</p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.colorsEnabled}
            onChange={(e) => setForm({ ...form, colorsEnabled: e.target.checked })}
            className="rounded border-border bg-background"
          />
          <span className="text-sm">Show color options for this product</span>
        </label>

        {form.colorsEnabled && (
          <div className="space-y-3">
            {(() => {
              const colorList = form.colors ? form.colors.split(",").map((c) => c.trim()).filter(Boolean) : [];
              return colorList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {colorList.map((color, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border bg-secondary/50">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const updated = [...colorList];
                          updated[i] = e.target.value;
                          setForm({ ...form, colors: updated.join(",") });
                        }}
                        className="h-6 w-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-muted-foreground">{color}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = colorList.filter((_, j) => j !== i);
                          setForm({ ...form, colors: updated.join(",") });
                        }}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No colors added yet.</p>
              );
            })()}

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                id="newColor"
                className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <Input
                id="newColorHex"
                placeholder={labels.colorsPlaceholder}
                className="font-mono text-xs"
                maxLength={7}
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const hex = newColor.trim();
                    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
                      const updated = form.colors ? [...form.colors.split(",").map((c) => c.trim()).filter(Boolean), hex] : [hex];
                      setForm({ ...form, colors: updated.join(",") });
                      setNewColor("#FF0000");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const hex = newColor.trim();
                  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
                    const updated = form.colors ? [...form.colors.split(",").map((c) => c.trim()).filter(Boolean), hex] : [hex];
                    setForm({ ...form, colors: updated.join(",") });
                    setNewColor("#FF0000");
                  }
                }}
              >
                {labels.colorsAdd}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
