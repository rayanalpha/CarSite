"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Save,
  X,
  Loader2,
  Image,
  Upload,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
}

interface CategoryManagerProps {
  categories: Category[];
}

const t = {
  newCategory: "New Category",
  create: "Create",
  cancel: "Cancel",
  noCategories: "No categories yet",
  nameFa: "Category Name",
  nameEn: "Name (English)",
  description: "Description",
  confirmDelete: "Are you sure you want to delete this category?",
  products: "products",
};

export function CategoryManager({ categories: initial }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", nameEn: "", description: "", image: "" });
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setForm({ name: "", nameEn: "", description: "", image: "" });
    setEditingId(null);
    setShowNew(false);
  }

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, image: data.url }));
      }
    } catch {
      // upload failed silently
    }
    setUploadingIcon(false);
    if (iconInputRef.current) iconInputRef.current.value = "";
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image: form.image || null }),
    });
    if (res.ok) {
      resetForm();
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleUpdate(id: number) {
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form, image: form.image || null }),
    });
    if (res.ok) {
      resetForm();
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm(t.confirmDelete)) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, nameEn: cat.nameEn, description: cat.description || "", image: cat.image || "" });
    setShowNew(false);
  }

  return (
    <div className="space-y-4">
      <input
        ref={iconInputRef}
        type="file"
        accept="image/*"
        onChange={handleIconUpload}
        className="hidden"
        disabled={uploadingIcon}
      />
      {showNew ? (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder={t.nameFa}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              placeholder={t.nameEn}
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              dir="ltr"
            />
          </div>
          <Textarea
            placeholder={t.description}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <div className="flex items-center gap-3">
            {form.image ? (
              <div className="relative group flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-900 border border-border overflow-hidden">
                  <img
                    src={form.image}
                    alt="Category icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: "" })}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {uploadingIcon ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingIcon ? "Uploading..." : "Upload Icon"}
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="gap-1" disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {t.create}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNew(false)}>
              {t.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.newCategory}
        </Button>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-30" />
          <p className="text-muted-foreground">{t.noCategories}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              {editingId === cat.id ? (
                <div className="space-y-3">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t.nameFa}
                  />
                  <Input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder={t.nameEn}
                    dir="ltr"
                  />
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder={t.description}
                  />
                  <div className="flex items-center gap-3">
                    {form.image ? (
                      <div className="relative group flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-900 border border-border overflow-hidden">
                          <img
                            src={form.image}
                            alt="Category icon"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: "" })}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => iconInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {uploadingIcon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {uploadingIcon ? "Uploading..." : "Upload Icon"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1" onClick={() => handleUpdate(cat.id)} disabled={loading}>
                      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={resetForm}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {cat.image ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-900 border border-border overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : null}
                    <div>
                      <h3 className="font-medium text-sm">{cat.name}</h3>
                      {cat.nameEn && (
                        <p className="text-xs text-muted-foreground">{cat.nameEn}</p>
                      )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat._count.products} {t.products}
                    </p>
                  </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
