import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { Car, Shield, HeadphonesIcon, Truck } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: settings.aboutTitle || "About Us",
    description: settings.about || "About MotorPro — premium car accessories store",
    alternates: { canonical: `${siteUrl}/about` },
  };
}

const features = [
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "All products come with authenticity and quality warranty",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Nationwide delivery in the shortest possible time",
  },
  {
    icon: HeadphonesIcon,
    title: "Expert Advice",
    description: "Free consultation to help you choose the right product",
  },
  {
    icon: Car,
    title: "Automotive Experts",
    description: "Our team specializes in car accessories and modifications",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="container-main py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">{settings.aboutTitle || "About MotorPro"}</h1>
        <div className="text-muted-foreground leading-relaxed space-y-4">
          {settings.aboutContent ? (
            settings.aboutContent.split("\n").map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))
          ) : (
            <p>
              MotorPro is a specialized car accessories store. We bring together the best brands and
              products to offer you a unique car accessory shopping experience.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
