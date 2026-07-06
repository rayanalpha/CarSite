import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import { ensureProtocol } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: settings.contactTitle || "Contact Us",
    description: settings.contactDescription || "Contact MotorPro Store for orders, inquiries, and support",
    alternates: { canonical: `${siteUrl}/contact` },
  };
}

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsapp = settings.socials.find((s) => s.platform === "whatsapp");
  const whatsappUrl = ensureProtocol(whatsapp?.url || "#");

  const contactInfo = [
    { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/[^0-9+]/g, "")}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Address", value: settings.address },
    { icon: Clock, label: "Business Hours", value: settings.businessHours },
  ];

  return (
    <div className="container-main py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">{settings.contactTitle}</h1>
          <p className="text-muted-foreground">
            {settings.contactHeading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {contactInfo.map((info) => {
            const Icon = info.icon;
            return (
              <div
                key={info.label}
                className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-sm font-medium hover:text-primary transition-colors">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium">{info.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            For quick orders, contact us on WhatsApp
          </p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              Order on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
