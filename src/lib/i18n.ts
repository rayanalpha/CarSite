/*
 * i18n Foundation - Ready for multi-language support
 *
 * To add a new language:
 * 1. Create a new object with the same shape as `en` below
 * 2. Add it to the `dictionaries` map
 * 3. Use next-intl or a simple cookie-based locale detector
 *
 * Example future usage:
 *   import { getDictionary } from "@/lib/i18n";
 *   const t = getDictionary(locale); // "en" | "fa" | ...
 *   t.home.hero.title
 */

const en = {
  common: {
    siteName: "MotorPro",
    backToSite: "Back to Site",
    orderViaWhatsApp: "Order via WhatsApp",
    admin: "Admin",
    adminPanel: "Admin Panel",
  },
  nav: {
    home: "Home",
    categories: "Categories",
    products: "Products",
    about: "About",
    contact: "Contact",
  },
  home: {
    heroBadge: "Premium Car Accessories Store",
    heroTitle: "Personalize Your Ride With the Best Gear",
    heroDesc: "From professional audio systems to custom interior mods — everything for your car is here.",
    browseProducts: "Browse Products",
    viewCategories: "Categories",
    categoriesTitle: "Categories",
    allCategories: "All Categories",
    featuredTitle: "Featured Products",
    allProducts: "All Products",
    ctaTitle: "Ready to Order?",
    ctaDesc: "Contact us directly on WhatsApp for free consultation, pricing, and orders.",
    ctaButton: "Order via WhatsApp",
  },
  products: {
    title: "Products",
    desc: "All car accessories in one place",
    searchPlaceholder: "Search products...",
    category: "Category",
    all: "All",
    sortBy: "Sort By",
    newest: "Newest",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    noProducts: "No products found",
    back: "Back to Products",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    brand: "Brand",
    model: "Model",
    specs: "Specifications",
    shipping: "Nationwide shipping available",
    related: "Related Products",
  },
  categories: {
    title: "Categories",
    desc: "Browse car accessories by category",
    noCategories: "No categories yet",
    viewProducts: "View Products",
    back: "Back to Categories",
    noProducts: "No products in this category",
  },
  about: {
    title: "About Us",
    desc: "About MotorPro Store",
    heading: "About MotorPro",
    body: "MotorPro is a specialized car accessories store. We bring together the best brands and products to offer you a unique car accessory shopping experience.",
    quality: "Quality Guaranteed",
    qualityDesc: "All products come with authenticity and quality warranty",
    shipping: "Fast Shipping",
    shippingDesc: "Nationwide delivery in the shortest possible time",
    support: "Expert Advice",
    supportDesc: "Free consultation to help you choose the right product",
    expertise: "Automotive Experts",
    expertiseDesc: "Our team specializes in car accessories and modifications",
  },
  contact: {
    title: "Contact Us",
    desc: "Contact MotorPro Store",
    heading: "Contact Us",
    body: "Get in touch for consultation, orders, or any questions",
    phone: "Phone",
    email: "Email",
    address: "Address",
    hours: "Business Hours",
    hoursValue: "Mon–Fri, 9 AM – 8 PM",
    whatsappHint: "For quick orders, contact us on WhatsApp",
    whatsappButton: "Order on WhatsApp",
  },
  footer: {
    desc: "Your trusted source for premium car accessories. Quality products for your ride.",
    quickLinks: "Quick Links",
    newArrivals: "New Arrivals",
    featured: "Featured",
    contact: "Contact",
    social: "Social Media",
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  admin: {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    settings: "Settings",
    logout: "Logout",
    login: {
      title: "Admin Panel",
      password: "Password",
      placeholder: "Enter password",
      login: "Login",
      loggingIn: "Signing in...",
      error: "Login failed",
    },
    dashboardTitle: "Dashboard",
    dashboardDesc: "Store overview",
    outOfStock: "Out of Stock",
    featured: "Featured",
    newProduct: "New Product",
    editProduct: "Edit Product",
    save: "Save Changes",
    create: "Create Product",
    delete: "Delete",
    cancel: "Cancel",
    confirmDelete: "Are you sure?",
    noProducts: "No products yet",
    noCategories: "No categories yet",
    storeName: "Store Name",
    whatsApp: "WhatsApp Number",
    aboutStore: "About Store",
    saveSettings: "Save Settings",
  },
};

export type Dictionary = typeof en;

export const dictionaries: Record<string, Dictionary> = {
  en,
};

export function getDictionary(locale: string = "en"): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
