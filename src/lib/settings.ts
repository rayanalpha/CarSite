import { cache } from "react";
import { prisma } from "@/lib/prisma";

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
  icon: string;
}

export interface SiteSettings {
  storeName: string;
  about: string;
  aboutTitle: string;
  aboutContent: string;
  contactTitle: string;
  contactDescription: string;
  contactHeading: string;
  businessHours: string;
  phone: string;
  email: string;
  address: string;
  siteIcon: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementStart: string;
  announcementEnd: string;
  heroSliderImages: string[];
  heroSliderInterval: number;
  heroEnabled: boolean;
  heroAutoPlay: boolean;
  heroAllBrandsHeading: string;
  heroAllBrandsDescription: string;
  socials: SocialLink[];
}

const defaults: SiteSettings = {
  storeName: "MotorPro",
  about: "Your trusted source for premium car accessories.",
  aboutTitle: "About MotorPro",
  aboutContent: "",
  contactTitle: "Contact Us",
  contactDescription: "Contact MotorPro Store",
  contactHeading: "Get in touch for consultation, orders, or any questions",
  businessHours: "Mon–Fri, 9 AM – 8 PM",
  phone: "+1 234 567 890",
  email: "info@motorpro.store",
  address: "New York, USA",
  siteIcon: "",
  announcementEnabled: false,
  announcementText: "",
  announcementStart: "",
  announcementEnd: "",
  heroSliderImages: [],
  heroSliderInterval: 5,
  heroEnabled: true,
  heroAutoPlay: true,
  heroAllBrandsHeading: "Personalize Your Ride With the Best Gear",
  heroAllBrandsDescription: "Premium car accessories for every brand. Quality you can trust.",
  socials: [
    { platform: "instagram", label: "Instagram", url: "#", enabled: true, icon: "Instagram" },
    { platform: "whatsapp", label: "WhatsApp", url: "#", enabled: true, icon: "MessageCircle" },
    { platform: "telegram", label: "Telegram", url: "#", enabled: false, icon: "Send" },
    { platform: "tiktok", label: "TikTok", url: "#", enabled: false, icon: "Music" },
  ],
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }

    return {
      storeName: map.store_name || defaults.storeName,
      about: map.about || defaults.about,
      aboutTitle: map.about_title || defaults.aboutTitle,
      aboutContent: map.about_content || defaults.aboutContent,
      contactTitle: map.contact_title || defaults.contactTitle,
      contactDescription: map.contact_description || defaults.contactDescription,
      contactHeading: map.contact_heading || defaults.contactHeading,
      businessHours: map.business_hours || defaults.businessHours,
      phone: map.phone || defaults.phone,
      email: map.email || defaults.email,
      address: map.address || defaults.address,
      siteIcon: map.site_icon || defaults.siteIcon,
      announcementEnabled: map.announcement_enabled === "true",
      heroSliderImages: map.hero_slider_images ? map.hero_slider_images.split(",").filter(Boolean) : defaults.heroSliderImages,
      heroSliderInterval: map.hero_slider_interval ? Number(map.hero_slider_interval) : defaults.heroSliderInterval,
      heroEnabled: map.hero_enabled === "false" ? false : defaults.heroEnabled,
      heroAutoPlay: map.hero_auto_play === "false" ? false : defaults.heroAutoPlay,
      heroAllBrandsHeading: map.hero_all_brands_heading || defaults.heroAllBrandsHeading,
      heroAllBrandsDescription: map.hero_all_brands_description || defaults.heroAllBrandsDescription,
      announcementText: map.announcement_text || defaults.announcementText,
      announcementStart: map.announcement_start || defaults.announcementStart,
      announcementEnd: map.announcement_end || defaults.announcementEnd,
      socials: defaults.socials.map((s) => ({
        ...s,
        url: map[`social_${s.platform}_url`] || s.url,
        enabled: map[`social_${s.platform}_enabled`] === "true" || (map[`social_${s.platform}_enabled`] === undefined ? s.enabled : false),
      })),
    };
  } catch {
    return defaults;
  }
});

export function getSocialIconComponent(icon: string) {
  const icons: Record<string, string> = {
    Instagram: "Instagram",
    MessageCircle: "MessageCircle",
    Send: "Send",
    Music: "Music",
  };
  return icons[icon] || "Link";
}
