/*
  Warnings:

  - You are about to drop the column `gameType` on the `DiscountClaim` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscountClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "discountCode" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DiscountClaim" ("claimedAt", "discountCode", "email", "firstName", "id", "lastName", "percentage", "shop") SELECT "claimedAt", "discountCode", "email", "firstName", "id", "lastName", "percentage", "shop" FROM "DiscountClaim";
DROP TABLE "DiscountClaim";
ALTER TABLE "new_DiscountClaim" RENAME TO "DiscountClaim";
CREATE INDEX "DiscountClaim_shop_idx" ON "DiscountClaim"("shop");
CREATE INDEX "DiscountClaim_email_idx" ON "DiscountClaim"("email");
CREATE UNIQUE INDEX "DiscountClaim_shop_email_key" ON "DiscountClaim"("shop", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
