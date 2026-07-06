"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Upload, X, Image as ImageIcon, Instagram, MessageCircle, Send, Music, KeyRound } from "lucide-react";
import { toast } from "sonner";

const platforms = [
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "telegram", label: "Telegram", icon: Send },
  { key: "tiktok", label: "TikTok", icon: Music },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [form, setForm] = useState({
    store_name: "",
    about: "",
    about_title: "",
    about_content: "",
    contact_title: "",
    contact_description: "",
    contact_heading: "",
    business_hours: "",
    phone: "",
    email: "",
    address: "",
    announcement_enabled: "false",
    announcement_text: "",
    announcement_start: "",
    announcement_end: "",
  });
  const [siteIcon, setSiteIcon] = useState("");
  const [heroEnabled, setHeroEnabled] = useState(true);
  const [heroAutoPlay, setHeroAutoPlay] = useState(true);
  const [heroInterval, setHeroInterval] = useState("5");
  const [heroAllBrandsHeading, setHeroAllBrandsHeading] = useState("");
  const [heroAllBrandsDescription, setHeroAllBrandsDescription] = useState("");
  const [socials, setSocials] = useState<
    { platform: string; url: string; enabled: boolean }[]
  >([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          store_name: data.store_name || "MotorPro",
          about: data.about || "",
          about_title: data.about_title || "",
          about_content: data.about_content || "",
          contact_title: data.contact_title || "",
          contact_description: data.contact_description || "",
          contact_heading: data.contact_heading || "",
          business_hours: data.business_hours || "",
          phone: data.phone || "+1 234 567 890",
          email: data.email || "info@motorpro.store",
          address: data.address || "New York, USA",
          announcement_enabled: data.announcement_enabled || "false",
          announcement_text: data.announcement_text || "",
          announcement_start: data.announcement_start || "",
          announcement_end: data.announcement_end || "",
        });
        setSiteIcon(data.site_icon || "");
        setHeroEnabled(data.hero_enabled !== "false");
        setHeroAutoPlay(data.hero_auto_play !== "false");
        setHeroInterval(data.hero_slider_interval || "5");
        setHeroAllBrandsHeading(data.hero_all_brands_heading || "Personalize Your |Ride| With the Best Gear");
        setHeroAllBrandsDescription(data.hero_all_brands_description || "Premium car accessories for every brand. Quality you can trust.");
        setSocials(
          platforms.map((p) => ({
            platform: p.key,
            url: data[`social_${p.key}_url`] || "",
            enabled: data[`social_${p.key}_enabled`] === "true",
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleIconUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setSiteIcon(data.url);
      }
    } finally {
      setUploadingIcon(false);
      e.target.value = "";
    }
  }, []);

  async function handleSave() {
    setSaving(true);

    const payload: Record<string, string> = { ...form, site_icon: siteIcon, hero_slider_interval: heroInterval, hero_enabled: heroEnabled ? "true" : "false", hero_auto_play: heroAutoPlay ? "true" : "false", hero_all_brands_heading: heroAllBrandsHeading, hero_all_brands_description: heroAllBrandsDescription };
    for (const s of socials) {
      payload[`social_${s.platform}_url`] = s.url;
      payload[`social_${s.platform}_enabled`] = s.enabled ? "true" : "false";
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to save settings" }));
        toast.error(err.error || "Failed to save settings");
      } else {
        toast.success("Settings saved successfully");
      }
    } catch (e) {
      toast.error("Settings save error");
      console.error("Settings save error:", e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Store settings</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">General</h2>
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input
              value={form.store_name}
              onChange={(e) =>
                setForm({ ...form, store_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>About Store</Label>
            <Textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">About Page</h2>
          <p className="text-xs text-muted-foreground">
            Customize the About page content. The feature cards below are always shown.
          </p>
          <div className="space-y-2">
            <Label>Page Title</Label>
            <Input
              value={form.about_title}
              onChange={(e) => setForm({ ...form, about_title: e.target.value })}
              placeholder="About MotorPro"
            />
          </div>
          <div className="space-y-2">
            <Label>Page Content</Label>
            <Textarea
              value={form.about_content}
              onChange={(e) => setForm({ ...form, about_content: e.target.value })}
              rows={6}
              placeholder="Write the About page content here... Use line breaks for paragraphs."
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Contact Page</h2>
          <p className="text-xs text-muted-foreground">
            Customize the Contact page title, description, and business hours.
          </p>
          <div className="space-y-2">
            <Label>Page Title</Label>
            <Input
              value={form.contact_title}
              onChange={(e) => setForm({ ...form, contact_title: e.target.value })}
              placeholder="Contact Us"
            />
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Input
              value={form.contact_description}
              onChange={(e) => setForm({ ...form, contact_description: e.target.value })}
              placeholder="Contact MotorPro Store"
            />
          </div>
          <div className="space-y-2">
            <Label>Page Heading</Label>
            <Input
              value={form.contact_heading}
              onChange={(e) => setForm({ ...form, contact_heading: e.target.value })}
              placeholder="Get in touch for consultation, orders, or any questions"
            />
          </div>
          <div className="space-y-2">
            <Label>Business Hours</Label>
            <Input
              value={form.business_hours}
              onChange={(e) => setForm({ ...form, business_hours: e.target.value })}
              placeholder="Mon–Fri, 9 AM – 8 PM"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Site Icon</h2>
          <p className="text-xs text-muted-foreground">
            Upload a square icon (PNG, JPG). It will appear in the header and as the browser tab favicon.
          </p>
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-secondary overflow-hidden shrink-0">
              {siteIcon ? (
                <>
                  <img
                    src={siteIcon}
                    alt="Site Icon"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSiteIcon("")}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 transition-colors text-sm text-muted-foreground hover:text-foreground">
                {uploadingIcon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploadingIcon ? "Uploading..." : "Upload Icon"}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleIconUpload}
                className="hidden"
                disabled={uploadingIcon}
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Hero Section</h2>
          <p className="text-xs text-muted-foreground">
            Configure the homepage hero slider. Brand slides are managed in the Brands section — set a Hero Image and Description on each brand to show it here.
          </p>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={heroEnabled}
              onChange={(e) => setHeroEnabled(e.target.checked)}
              className="rounded border-border bg-background"
            />
            <span className="text-sm font-medium">Enable hero section</span>
          </label>

          {heroEnabled && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heroAutoPlay}
                  onChange={(e) => setHeroAutoPlay(e.target.checked)}
                  className="rounded border-border bg-background"
                />
                <span className="text-sm">Auto-play slides</span>
              </label>

              <div className="space-y-2">
                <Label>Slide Interval (seconds)</Label>
                <Input
                  type="number"
                  min={2}
                  max={60}
                  value={heroInterval}
                  onChange={(e) => setHeroInterval(e.target.value)}
                  className="w-32"
                />
              </div>

              <div className="space-y-2">
                <Label>All Brands — Heading</Label>
                <Input
                  value={heroAllBrandsHeading}
                  onChange={(e) => setHeroAllBrandsHeading(e.target.value)}
                  placeholder="Personalize Your |Ride| With the Best Gear"
                />
                <p className="text-[10px] text-muted-foreground">
                  Use <code className="bg-secondary px-1 rounded">|text|</code> to highlight a word with the accent color gradient.
                </p>
              </div>

              <div className="space-y-2">
                <Label>All Brands — Description</Label>
                <Textarea
                  value={heroAllBrandsDescription}
                  onChange={(e) => setHeroAllBrandsDescription(e.target.value)}
                  rows={3}
                  placeholder="Premium car accessories for every brand. Quality you can trust."
                />
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Announcement Bar</h2>
          <p className="text-xs text-muted-foreground">
            Display a scrolling announcement bar at the top of the site.
          </p>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.announcement_enabled === "true"}
              onChange={(e) => setForm({ ...form, announcement_enabled: e.target.checked ? "true" : "false" })}
              className="rounded border-border bg-background"
            />
            <span className="text-sm">Enable announcement bar</span>
          </label>

          {form.announcement_enabled === "true" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="announcement_text">Announcement Text</Label>
                <Input
                  id="announcement_text"
                  value={form.announcement_text}
                  onChange={(e) => setForm({ ...form, announcement_text: e.target.value })}
                  placeholder="Free shipping on orders over $100 — use code FREESHIP"
                  maxLength={200}
                />
                <p className="text-[10px] text-muted-foreground">
                  {form.announcement_text.length}/200 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement_start">Start Date (optional)</Label>
                  <Input
                    id="announcement_start"
                    type="datetime-local"
                    value={form.announcement_start}
                    onChange={(e) => setForm({ ...form, announcement_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement_end">End Date (optional)</Label>
                  <Input
                    id="announcement_end"
                    type="datetime-local"
                    value={form.announcement_end}
                    onChange={(e) => setForm({ ...form, announcement_end: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Social Media Links</h2>
          <p className="text-xs text-muted-foreground">
            Configure social media links. Disabled links won&apos;t show on the site.
          </p>

          {socials.map((social, i) => {
            const platform = platforms.find((p) => p.key === social.platform)!;
            const Icon = platform.icon;
            return (
              <div
                key={social.platform}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={social.enabled}
                      onChange={(e) => {
                        const updated = [...socials];
                        updated[i] = {
                          ...updated[i],
                          enabled: e.target.checked,
                        };
                        setSocials(updated);
                      }}
                      className="rounded border-border bg-background"
                    />
                    {platform.label}
                  </label>
                  <Input
                    value={social.url}
                    onChange={(e) => {
                      const updated = [...socials];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setSocials(updated);
                    }}
                    placeholder={`${platform.label} URL`}
                    dir="ltr"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Change Password
          </h2>
          <p className="text-xs text-muted-foreground">
            Update your admin panel password. You will stay logged in after changing it.
          </p>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => {
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                setPasswordError("");
                setPasswordSuccess("");
              }}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => {
                setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                setPasswordError("");
                setPasswordSuccess("");
              }}
              dir="ltr"
            />
            <p className="text-[10px] text-muted-foreground">
              At least 6 characters
            </p>
          </div>

          {passwordError && (
            <p className="text-xs text-red-500">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-xs text-green-500">{passwordSuccess}</p>
          )}

          <Button
            onClick={async () => {
              setChangingPassword(true);
              setPasswordError("");
              setPasswordSuccess("");
              try {
                const res = await fetch("/api/auth/change-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(passwordForm),
                });
                if (res.ok) {
                  setPasswordSuccess("Password changed successfully");
                  setPasswordForm({ currentPassword: "", newPassword: "" });
                } else {
                  const data = await res.json();
                  setPasswordError(
                    typeof data.error === "string"
                      ? data.error
                      : JSON.stringify(data.error) || "Failed to change password"
                  );
                }
              } catch {
                setPasswordError("Failed to change password");
              } finally {
                setChangingPassword(false);
              }
            }}
            disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
            variant="outline"
            className="gap-2"
          >
            {changingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Change Password
          </Button>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
