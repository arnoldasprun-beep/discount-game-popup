-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "selectedGame" TEXT NOT NULL DEFAULT 'horizontal-lines',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "appEmbedEnabled" BOOLEAN NOT NULL DEFAULT false,
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
    "logoUrlMobile" TEXT,
    "logoScale" INTEGER NOT NULL DEFAULT 100,
    "logoScaleMobile" INTEGER NOT NULL DEFAULT 100,
    "logoHeightDesktop" TEXT NOT NULL DEFAULT 'small',
    "logoHeightMobile" TEXT NOT NULL DEFAULT 'small',
    "showPopupHeaderText" BOOLEAN NOT NULL DEFAULT true,
    "bouncingBallSettings" JSONB,
    "horizontalLinesSettings" JSONB,
    "reactionClickSettings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GameSettings" ("appEmbedEnabled", "bouncingBallSettings", "createdAt", "discountCodeOrderNumber", "discountCodePrefix", "emailRequired", "enabled", "horizontalLinesSettings", "id", "logoHeightDesktop", "logoHeightMobile", "logoScale", "logoScaleMobile", "logoUrl", "logoUrlMobile", "popupCustomUrls", "popupDelay", "popupDisplayPage", "popupShowOnDesktop", "popupShowOnMobile", "reactionClickSettings", "requireName", "selectedGame", "shop", "showPopupHeaderText", "showStickyButton", "stickyButtonColor", "stickyButtonCustomUrls", "stickyButtonDisplayPage", "stickyButtonPosition", "stickyButtonShowOnDesktop", "stickyButtonShowOnMobile", "stickyButtonText", "stickyButtonTextColor", "updatedAt") SELECT "appEmbedEnabled", "bouncingBallSettings", "createdAt", "discountCodeOrderNumber", "discountCodePrefix", "emailRequired", "enabled", "horizontalLinesSettings", "id", "logoHeightDesktop", "logoHeightMobile", "logoScale", "logoScaleMobile", "logoUrl", "logoUrlMobile", "popupCustomUrls", "popupDelay", "popupDisplayPage", "popupShowOnDesktop", "popupShowOnMobile", "reactionClickSettings", "requireName", "selectedGame", "shop", "showPopupHeaderText", "showStickyButton", "stickyButtonColor", "stickyButtonCustomUrls", "stickyButtonDisplayPage", "stickyButtonPosition", "stickyButtonShowOnDesktop", "stickyButtonShowOnMobile", "stickyButtonText", "stickyButtonTextColor", "updatedAt" FROM "GameSettings";
DROP TABLE "GameSettings";
ALTER TABLE "new_GameSettings" RENAME TO "GameSettings";
CREATE UNIQUE INDEX "GameSettings_shop_key" ON "GameSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
