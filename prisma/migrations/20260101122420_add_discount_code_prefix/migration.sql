-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "selectedGame" TEXT NOT NULL DEFAULT 'bouncing-ball',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "emailRequired" BOOLEAN NOT NULL DEFAULT true,
    "discountCodeOrderNumber" INTEGER NOT NULL DEFAULT 345,
    "discountCodePrefix" TEXT NOT NULL DEFAULT 'wincode',
    "bouncingBallSettings" JSONB,
    "horizontalLinesSettings" JSONB,
    "reactionClickSettings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GameSettings" ("bouncingBallSettings", "createdAt", "discountCodeOrderNumber", "emailRequired", "enabled", "horizontalLinesSettings", "id", "reactionClickSettings", "selectedGame", "shop", "updatedAt") SELECT "bouncingBallSettings", "createdAt", "discountCodeOrderNumber", "emailRequired", "enabled", "horizontalLinesSettings", "id", "reactionClickSettings", "selectedGame", "shop", "updatedAt" FROM "GameSettings";
DROP TABLE "GameSettings";
ALTER TABLE "new_GameSettings" RENAME TO "GameSettings";
CREATE UNIQUE INDEX "GameSettings_shop_key" ON "GameSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
