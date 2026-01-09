/*
  Warnings:

  - You are about to drop the `GamePlay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PopupView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `device` on the `DiscountClaim` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GamePlay_shop_sessionId_idx";

-- DropIndex
DROP INDEX "GamePlay_shop_idx";

-- DropIndex
DROP INDEX "PopupView_shop_sessionId_idx";

-- DropIndex
DROP INDEX "PopupView_shop_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GamePlay";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PopupView";
PRAGMA foreign_keys=on;

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
    "gameType" TEXT,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DiscountClaim" ("claimedAt", "discountCode", "email", "firstName", "gameType", "id", "lastName", "percentage", "shop") SELECT "claimedAt", "discountCode", "email", "firstName", "gameType", "id", "lastName", "percentage", "shop" FROM "DiscountClaim";
DROP TABLE "DiscountClaim";
ALTER TABLE "new_DiscountClaim" RENAME TO "DiscountClaim";
CREATE INDEX "DiscountClaim_shop_idx" ON "DiscountClaim"("shop");
CREATE INDEX "DiscountClaim_email_idx" ON "DiscountClaim"("email");
CREATE UNIQUE INDEX "DiscountClaim_shop_email_key" ON "DiscountClaim"("shop", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
