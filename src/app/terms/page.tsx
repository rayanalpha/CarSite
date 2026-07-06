import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: "Terms of Service",
    description: "Terms of Service for MotorPro Store — products, pricing, orders, shipping, returns, and warranty",
    alternates: { canonical: `${siteUrl}/terms` },
  };
}

export default function TermsPage() {
  return (
    <div className="container-main py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the MotorPro website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. General Terms</h2>
          <p>
            MotorPro is an online store specializing in car accessories. We reserve the right to refuse service to anyone for any reason at any time. By placing an order, you agree to provide accurate and complete information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Products and Pricing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All prices are listed in the currency shown on the product page and are subject to change without notice.</li>
            <li>We make every effort to display accurate product images and descriptions, but we cannot guarantee that your monitor&apos;s display accurately reflects the actual product.</li>
            <li>We reserve the right to modify or discontinue any product without prior notice.</li>
            <li>In the event of a pricing error, we reserve the right to cancel or refuse any orders placed for that product.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Orders and Payment</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>By placing an order, you agree to pay the full amount specified at checkout.</li>
            <li>We accept payment via the methods displayed during checkout.</li>
            <li>Orders are confirmed via WhatsApp or email after we verify availability and payment.</li>
            <li>We reserve the right to limit quantities or refuse orders at our discretion.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Shipping and Delivery</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Shipping times are estimates and not guaranteed. Delays may occur due to circumstances beyond our control.</li>
            <li>Delivery costs are calculated based on the shipping method and destination selected at checkout.</li>
            <li>Risk of loss and title for items pass to you upon delivery to the carrier.</li>
            <li>It is your responsibility to provide an accurate shipping address. We are not liable for packages delivered to incorrect addresses provided by you.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Returns and Refunds</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We accept returns within 7 days of delivery for defective or incorrect items.</li>
            <li>Products must be unused and in their original packaging to be eligible for return.</li>
            <li>Custom or special-order items are non-returnable unless defective.</li>
            <li>Refunds are processed within 5–7 business days after we receive and inspect the returned item.</li>
            <li>Shipping costs for returns are the responsibility of the customer unless the return is due to our error.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Warranty</h2>
          <p>
            All products come with the manufacturer&apos;s warranty unless otherwise stated. Warranty terms vary by product and brand. We will assist you in processing warranty claims but are not directly responsible for manufacturer warranty fulfillment.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Limitation of Liability</h2>
          <p>
            MotorPro shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or purchase of our products. Our total liability is limited to the amount paid for the product in question.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">9. Intellectual Property</h2>
          <p>
            All content on this website including text, graphics, logos, images, and software is the property of MotorPro or its content suppliers and is protected by applicable copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">10. Changes to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the site after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">11. Governing Law</h2>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the applicable laws. Any disputes arising from these terms shall be resolved through amicable negotiation or in the competent courts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">12. Contact Information</h2>
          <p>
            For any questions regarding these Terms of Service, please contact us via WhatsApp, email, or through our contact page. We are here to help and will respond promptly.
          </p>
        </section>
      </div>
    </div>
  );
}
