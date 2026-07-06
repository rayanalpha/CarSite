import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBarWrapper } from "@/components/layout/announcement-bar-wrapper";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { QuickViewProvider } from "@/components/shop/quick-view-context";
import { StoryProvider } from "@/components/stories/story-provider";
import { StoryRings } from "@/components/stories/story-rings";
import { StoryViewer } from "@/components/stories/story-viewer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { JsonLdScripts } from "@/components/layout/json-ld-scripts";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: `${settings.storeName} | Car Accessories Store`,
      template: `%s | ${settings.storeName}`,
    },
    description:
      "Premium car accessories store. Speakers, interior decorations, lighting, rims, and all automotive accessories with top quality.",
    keywords: [
      "car accessories",
      "car speakers",
      "auto parts",
      "car interior",
      "car audio system",
      "automotive accessories",
    ],
    icons: settings.siteIcon
      ? {
          icon: settings.siteIcon,
          apple: settings.siteIcon,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: settings.storeName,
      title: `${settings.storeName} | Premium Car Accessories & Auto Parts Store`,
      description:
        "Premium car accessories store. Speakers, interior decorations, lighting, rims, and more.",
      images: settings.siteIcon ? [{ url: settings.siteIcon }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <JsonLdScripts />
        <ThemeProvider>
          <QuickViewProvider>
            <StoryProvider>
              <AnnouncementBarWrapper />
              <StoryRings />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <BottomNav />
              <StoryViewer />
            </StoryProvider>
          </QuickViewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
