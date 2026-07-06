import { getSettings } from "@/lib/settings";

export async function JsonLdScripts() {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: settings.storeName,
        url: siteUrl,
        logo: settings.siteIcon || undefined,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: settings.phone || undefined,
          contactType: "customer service",
        },
      },
      {
        "@type": "WebSite",
        name: settings.storeName,
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/products?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var theme = localStorage.getItem("theme");
              if (theme === "dark") {
                document.documentElement.classList.add("dark");
              }
            })();
          `,
        }}
      />
    </>
  );
}
