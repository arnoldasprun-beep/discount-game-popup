-- CreateTable
CREATE TABLE "DiscountClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "discountCode" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GamePlay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PopupView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "selectedGame" TEXT NOT NULL DEFAULT 'bouncing-ball',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "popupShowOnDesktop" BOOLEAN NOT NULL DEFAULT true,
    "popupShowOnMobile" BOOLEAN NOT NULL DEFAULT true,
    "popupDelay" TEXT NOT NULL DEFAULT '0',
    "popupDisplayPage" TEXT NOT NULL DEFAULT 'any',
    "popupCustomUrls" JSONB,
    "emailRequired" BOOLEAN NOT NULL DEFAULT true,
    "requireName" BOOLEAN NOT NULL DEFAULT false,
    "discountCodeOrderNumber" INTEGER NOT NULL DEFAULT 345,
    "discountCodePrefix" TEXT NOT NULL DEFAULT 'wincode',
    "showStickyButton" BOOLEAN NOT NULL DEFAULT false,
    "stickyButtonText" TEXT NOT NULL DEFAULT 'Discount Game',
    "stickyButtonColor" TEXT NOT NULL DEFAULT '#000000',
    "stickyButtonTextColor" TEXT NOT NULL DEFAULT '#ffffff',
    "stickyButtonPosition" TEXT NOT NULL DEFAULT 'right',
    "stickyButtonDisplayPage" TEXT NOT NULL DEFAULT 'any',
    "stickyButtonCustomUrls" JSONB,
    "stickyButtonShowOnDesktop" BOOLEAN NOT NULL DEFAULT true,
    "stickyButtonShowOnMobile" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "logoScale" INTEGER NOT NULL DEFAULT 100,
    "logoScaleMobile" INTEGER NOT NULL DEFAULT 100,
    "showPopupHeaderText" BOOLEAN NOT NULL DEFAULT true,
    "bouncingBallSettings" JSONB,
    "horizontalLinesSettings" JSONB,
    "reactionClickSettings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GameSettings" ("bouncingBallSettings", "createdAt", "discountCodeOrderNumber", "discountCodePrefix", "emailRequired", "enabled", "horizontalLinesSettings", "id", "reactionClickSettings", "selectedGame", "shop", "updatedAt") SELECT "bouncingBallSettings", "createdAt", "discountCodeOrderNumber", "discountCodePrefix", "emailRequired", "enabled", "horizontalLinesSettings", "id", "reactionClickSettings", "selectedGame", "shop", "updatedAt" FROM "GameSettings";
DROP TABLE "GameSettings";
ALTER TABLE "new_GameSettings" RENAME TO "GameSettings";
CREATE UNIQUE INDEX "GameSettings_shop_key" ON "GameSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DiscountClaim_shop_idx" ON "DiscountClaim"("shop");

-- CreateIndex
CREATE INDEX "DiscountClaim_email_idx" ON "DiscountClaim"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountClaim_shop_email_key" ON "DiscountClaim"("shop", "email");

-- CreateIndex
CREATE INDEX "GamePlay_shop_idx" ON "GamePlay"("shop");

-- CreateIndex
CREATE INDEX "GamePlay_shop_sessionId_idx" ON "GamePlay"("shop", "sessionId");

-- CreateIndex
CREATE INDEX "PopupView_shop_idx" ON "PopupView"("shop");

-- CreateIndex
CREATE INDEX "PopupView_shop_sessionId_idx" ON "PopupView"("shop", "sessionId");
