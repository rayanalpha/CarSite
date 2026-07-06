import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().positive().optional().nullable(),
  images: z.string().optional().nullable(),
  specs: z.string().optional().nullable(),
  brandId: z.number().int().positive().optional().nullable(),
  model: z.string().max(100).optional().nullable(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  tiktokEnabled: z.boolean().optional(),
  tiktokUrl: z.string().url().max(500).optional().nullable(),
  guideEnabled: z.boolean().optional(),
  guideUrl: z.string().url().max(500).optional().nullable(),
  guideContent: z.string().max(10000).optional().nullable(),
  salePrice: z.number().positive().optional().nullable(),
  saleStart: z.string().optional().nullable(),
  saleEnd: z.string().optional().nullable(),
  colorsEnabled: z.boolean().optional(),
  colors: z.string().max(500).optional().nullable(),
  status: z.enum(["active", "draft"]).optional(),
  categoryId: z.number().int().positive(),
});

export const BrandSchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional().default(""),
  logo: z.string().max(500).optional().nullable(),
  heroImage: z.string().max(500).optional().nullable(),
  heroDescription: z.string().max(500).optional().nullable(),
});

export const CategorySchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional().default(""),
  description: z.string().max(1000).optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  parentId: z.number().int().positive().optional().nullable(),
});

export const ALLOWED_SETTING_KEYS = [
  "store_name",
  "about",
  "phone",
  "email",
  "address",
  "site_icon",
  "announcement_enabled",
  "announcement_text",
  "announcement_start",
  "announcement_end",
  "social_instagram_url",
  "social_instagram_enabled",
  "social_whatsapp_url",
  "social_whatsapp_enabled",
  "social_telegram_url",
  "social_telegram_enabled",
  "social_tiktok_url",
  "social_tiktok_enabled",
  "about_title",
  "about_content",
  "contact_title",
  "contact_description",
  "contact_heading",
  "business_hours",
  "hero_slider_images",
  "hero_slider_interval",
  "hero_enabled",
  "hero_auto_play",
  "hero_all_brands_heading",
  "hero_all_brands_description",
] as const;

const SettingKeySchema = z.enum(ALLOWED_SETTING_KEYS);

export const SettingsSchema = z.record(SettingKeySchema, z.string());

export const ImageFileSchema = z.object({
  size: z.number().max(10 * 1024 * 1024, "File must be under 10MB"),
  type: z.enum(["image/jpeg", "image/png", "image/webp"], { message: "Only JPEG, PNG, WebP allowed" }),
});

export const StoryUpdateSchema = z.object({
  link: z.string().max(500).optional().nullable(),
  linkText: z.string().max(200).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const LoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export function isValidId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
