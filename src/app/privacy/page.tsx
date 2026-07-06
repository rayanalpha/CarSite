import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: "Privacy Policy",
    description: "Privacy Policy for MotorPro Store — learn how we collect, use, and protect your data",
    alternates: { canonical: `${siteUrl}/privacy` },
  };
}

export default function PrivacyPage() {
  return (
    <div className="container-main py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Introduction</h2>
          <p>
            MotorPro (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Personal Data:</strong> Name, email address, phone number, and shipping address when you place an order or contact us.</li>
            <li><strong>Order Data:</strong> Products purchased, order history, and transaction details.</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on the site, and browsing behavior to improve our services.</li>
            <li><strong>Communication Data:</strong> Messages sent via WhatsApp, email, or contact forms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Processing and fulfilling your orders</li>
            <li>Communicating with you about your orders and inquiries</li>
            <li>Improving our website, products, and customer service</li>
            <li>Sending promotional offers and updates (only with your consent)</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your data only with trusted service providers who assist us in operating our website and conducting business, provided they agree to keep your information confidential.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Security</h2>
          <p>
            We implement industry-standard security measures including SSL encryption to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Cookies</h2>
          <p>
            We use minimal cookies necessary for the proper functioning of our website. You can control cookie preferences through your browser settings. We do not use tracking cookies for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites (e.g., WhatsApp, social media). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us via WhatsApp, email, or through our contact page. We will respond to your inquiry as soon as possible.
          </p>
        </section>
      </div>
    </div>
  );
}
