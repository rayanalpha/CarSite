import Link from "next/link";
import Image from "next/image";
import { Car, Phone, Mail, MapPin, Instagram, MessageCircle, Send, Music } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { ensureProtocol } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  MessageCircle: <MessageCircle className="h-4 w-4" />,
  Send: <Send className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
};

export async function Footer() {
  const settings = await getSettings();
  const enabledSocials = settings.socials.filter((s) => s.enabled);

  return (
    <footer className="border-t border-border/50 bg-background/50 pb-20 md:pb-0">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                {settings.siteIcon ? (
                  <Image src={settings.siteIcon} alt={settings.storeName} fill className="object-cover" sizes="32px" quality={85} unoptimized={settings.siteIcon.startsWith("/uploads/") || settings.siteIcon.startsWith("/api/uploads/")} />
                ) : (
                  <Car className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="font-bold">
                <span className="text-gradient">{settings.storeName}</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings.aboutContent || settings.about}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">Products</Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">Categories</Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {settings.phone}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {settings.email}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {settings.address}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Social Media</h3>
            {enabledSocials.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {enabledSocials.map((s) => (
                  <Link
                    key={s.platform}
                    href={ensureProtocol(s.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
                  >
                    {iconMap[s.icon] || <Link2Icon />}
                  </Link>
                ))}
              </div>
            )}
            {settings.socials.find((s) => s.platform === "whatsapp")?.enabled && (
              <div className="mt-4">
                <Link
                  href={ensureProtocol(settings.socials.find((s) => s.platform === "whatsapp")?.url || "#")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MessageCircle className="h-4 w-4" />
                  Order via WhatsApp
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            All rights reserved. {settings.storeName} &copy; {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Link2Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
