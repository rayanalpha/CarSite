import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.product.deleteMany();
  await prisma.activityLog.deleteMany({ where: { entityType: "product" } });
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const catData = [
    { name: "Android CarPlay", nameEn: "Android CarPlay", slug: "android-carplay" },
    { name: "Audio System", nameEn: "Audio System", slug: "audio-system" },
    { name: "Tint Film Window", nameEn: "Tint Film Window", slug: "tint-film-window" },
    { name: "LED Lights", nameEn: "LED Lights", slug: "led-lights" },
    { name: "Camera", nameEn: "Camera", slug: "camera" },
    { name: "Dash Camera", nameEn: "Dash Camera", slug: "dash-camera" },
  ];

  for (const c of catData) {
    await prisma.category.create({ data: c });
  }

  // Create brands
  const brandData = [
    {
      name: "Toyota", nameEn: "Toyota", slug: "toyota", logo: "/brands/toyota.svg",
      heroImage: "/hero/toyota.jpg",
      heroDescription: "Reliability & Innovation — Discover premium accessories for your Toyota.",
    },
    {
      name: "Nissan", nameEn: "Nissan", slug: "nissan", logo: "/brands/nissan.svg",
      heroImage: "/hero/nissan.jpg",
      heroDescription: "Performance & Style — Upgrade your Nissan with the best gear.",
    },
    {
      name: "BMW", nameEn: "BMW", slug: "bmw", logo: "/brands/bmw.svg",
      heroImage: "/hero/bmw.jpg",
      heroDescription: "Luxury & Precision — Tailor-made accessories for your BMW.",
    },
    {
      name: "Mercedes", nameEn: "Mercedes", slug: "mercedes", logo: "/brands/mercedes.svg",
      heroImage: "/hero/mercedes.jpg",
      heroDescription: "Elegance & Power — Enhance your Mercedes drive.",
    },
    {
      name: "Jeep", nameEn: "Jeep", slug: "jeep", logo: "/brands/jeep.svg",
      heroImage: "/hero/jeep.jpg",
      heroDescription: "Off-Road Legend — Gear up your Jeep for any adventure.",
    },
    {
      name: "Range Rover", nameEn: "Range Rover", slug: "range-rover", logo: "/brands/range-rover.svg",
    },
    {
      name: "Lamborghini", nameEn: "Lamborghini", slug: "lamborghini", logo: "/brands/lamborghini.svg",
    },
    {
      name: "Rolls-Royce", nameEn: "Rolls-Royce", slug: "rolls-royce", logo: "/brands/rolls-royce.svg",
    },
    {
      name: "Ferrari", nameEn: "Ferrari", slug: "ferrari", logo: "/brands/ferrari.svg",
    },
    {
      name: "Maserati", nameEn: "Maserati", slug: "maserati", logo: "/brands/maserati.svg",
    },
    {
      name: "GMC", nameEn: "GMC", slug: "gmc", logo: "/brands/gmc.svg",
    },
    {
      name: "Chevrolet", nameEn: "Chevrolet", slug: "chevrolet", logo: "/brands/chevrolet.svg",
    },
    {
      name: "Cadillac", nameEn: "Cadillac", slug: "cadillac", logo: "/brands/cadillac.svg",
    },
    {
      name: "Ford", nameEn: "Ford", slug: "ford", logo: "/brands/ford.svg",
    },
  ];

  for (const b of brandData) {
    await prisma.brand.create({ data: b });
  }

  // Create default admin if not exists
  const existingAdmin = await prisma.admin.findUnique({ where: { username: "admin" } });
  if (!existingAdmin) {
    const crypto = await import("node:crypto");
    const passwordHash = crypto.createHash("sha256").update("admin123").digest("hex");
    await prisma.admin.create({
      data: { username: "admin", password: passwordHash, name: "Admin" },
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
