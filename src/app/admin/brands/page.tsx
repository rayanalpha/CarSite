"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, AlertTriangle, Tags, Upload, ImageIcon, X } from "lucide-react";

interface Brand {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  logo: string | null;
  heroImage: string | null;
  heroDescription: string | null;
  _count: { products: number };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", nameEn: "", logo: "", heroImage: "", heroDescription: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function fetchBrands() {
    setLoading(true);
    try {
      const res = await fetch("/api/brands");
      setBrands(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, logo: data.url }));
      }
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  }, []);

  const handleHeroImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, heroImage: data.url }));
      }
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, []);

  function resetForm() {
    setForm({ name: "", nameEn: "", logo: "", heroImage: "", heroDescription: "" });
    setEditBrand(null);
    setShowForm(false);
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");

    try {
      const url = "/api/brands";
      const method = editBrand ? "PUT" : "POST";
      const body = editBrand
        ? { id: editBrand.id, ...form, logo: form.logo || null, heroImage: form.heroImage || null, heroDescription: form.heroDescription || null }
        : { ...form, logo: form.logo || null, heroImage: form.heroImage || null, heroDescription: form.heroDescription || null };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        fetchBrands();
      } else {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setConfirmDelete(null);
      fetchBrands();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete");
    }
  }

  function startEdit(brand: Brand) {
    setEditBrand(brand);
    setForm({ name: brand.name, nameEn: brand.nameEn, logo: brand.logo || "", heroImage: brand.heroImage || "", heroDescription: brand.heroDescription || "" });
    setShowForm(true);
    setError("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-muted-foreground text-sm">
            Manage {brands.length} brands
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500 mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 mb-6 space-y-4 max-w-md">
          <h3 className="font-semibold">{editBrand ? "Edit Brand" : "New Brand"}</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Name (English)</label>
            <Input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo</label>
            <div className="flex items-center gap-3">
              {form.logo ? (
                <div className="relative h-12 w-12 shrink-0 rounded-lg border border-border overflow-hidden bg-white dark:bg-gray-900 p-1">
                  <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logo: "" })}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-lg border border-dashed border-border flex items-center justify-center bg-secondary/30">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                <span className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" />
                  {uploadingLogo ? "Uploading..." : "Upload"}
                </span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Image</label>
            <div className="flex items-start gap-3">
              {form.heroImage ? (
                <div className="relative shrink-0 rounded-lg border border-border overflow-hidden bg-secondary w-28 h-16">
                  <img src={form.heroImage} alt="Hero" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, heroImage: "" })}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="shrink-0 rounded-lg border border-dashed border-border flex items-center justify-center bg-secondary/30 w-28 h-16">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} disabled={uploadingHero} />
                <span className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" />
                  {uploadingHero ? "Uploading..." : "Upload"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">1920×1080 recommended</p>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Description</label>
            <Textarea
              value={form.heroDescription}
              onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
              placeholder="Brief description shown on the hero slider..."
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editBrand ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-16">
          <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-30" />
          <p className="text-muted-foreground">No brands yet</p>
          <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first brand
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">English</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Slug</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Products</th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{brand.name}</td>
                  <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">{brand.nameEn || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground font-mono hidden md:table-cell">{brand.slug}</td>
                  <td className="p-3 text-sm">{brand._count.products}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(brand)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {confirmDelete === brand.id ? (
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(brand.id)} title="Confirm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(brand.id)} title="Delete">
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
                <h3 className="font-semibold">Delete Brand?</h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete the brand. Products assigned to it must be reassigned first.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => confirmDelete && handleDelete(confirmDelete)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
