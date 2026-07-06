import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function slugify(text: string | null | undefined): string {
  if (!text) return "untitled";
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "untitled";
}

export function toNum(v: unknown): number | undefined {
  return v !== undefined && v !== null && v !== "" ? Number(v) : undefined;
}

export function toNullOrUndefined(v: unknown): string | undefined {
  return v === "" || v === undefined || v === null ? undefined : String(v);
}

export function ensureProtocol(url: string): string {
  if (!url || url === "#") return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export async function uniqueSlug(
  base: string,
  checkExisting: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = base;
  let counter = 0;
  while (await checkExisting(slug)) {
    counter++;
    slug = `${base}-${counter}`;
  }
  return slug;
}
