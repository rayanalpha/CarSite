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
    "brand" TEXT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("brand", "categoryId", "colors", "colorsEnabled", "createdAt", "description", "featured", "guideContent", "guideEnabled", "guideUrl", "id", "images", "inStock", "model", "name", "nameEn", "price", "saleEnd", "salePrice", "saleStart", "slug", "specs", "tiktokEnabled", "tiktokUrl", "updatedAt") SELECT "brand", "categoryId", "colors", "colorsEnabled", "createdAt", "description", "featured", "guideContent", "guideEnabled", "guideUrl", "id", "images", "inStock", "model", "name", "nameEn", "price", "saleEnd", "salePrice", "saleStart", "slug", "specs", "tiktokEnabled", "tiktokUrl", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
