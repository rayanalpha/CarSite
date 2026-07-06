/*
  Warnings:

  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL,
    "images" TEXT,
    "specs" TEXT,
    "model" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tiktokEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tiktokUrl" TEXT,
    "guideEnabled" BOOLEAN NOT NULL DEFAULT false,
    "guideUrl" TEXT,
    "guideContent" TEXT,
    "salePrice" REAL,
    "saleStart" DATETIME,
    "saleEnd" DATETIME,
    "colorsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "colors" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "categoryId" INTEGER NOT NULL,
    "brandId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "colors", "colorsEnabled", "createdAt", "description", "featured", "guideContent", "guideEnabled", "guideUrl", "id", "images", "inStock", "model", "name", "nameEn", "price", "saleEnd", "salePrice", "saleStart", "slug", "specs", "status", "tiktokEnabled", "tiktokUrl", "updatedAt") SELECT "categoryId", "colors", "colorsEnabled", "createdAt", "description", "featured", "guideContent", "guideEnabled", "guideUrl", "id", "images", "inStock", "model", "name", "nameEn", "price", "saleEnd", "salePrice", "saleStart", "slug", "specs", "status", "tiktokEnabled", "tiktokUrl", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_featured_idx" ON "Product"("featured");
CREATE TABLE "new_Story" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "linkText" TEXT,
    "expiresAt" DATETIME,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Story" ("createdAt", "expiresAt", "id", "image", "link", "linkText", "sortOrder", "updatedAt") SELECT "createdAt", "expiresAt", "id", "image", "link", "linkText", "sortOrder", "updatedAt" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE INDEX "Story_expiresAt_idx" ON "Story"("expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
