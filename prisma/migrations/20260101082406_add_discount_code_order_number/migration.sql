/*
  Warnings:

  - You are about to alter the column `bouncingBallSettings` on the `GameSettings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `horizontalLinesSettings` on the `GameSettings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `reactionClickSettings` on the `GameSettings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
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
    "bouncingBallSettings" JSONB,
    "horizontalLinesSettings" JSONB,
    "reactionClickSettings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GameSettings" ("bouncingBallSettings", "createdAt", "emailRequired", "enabled", "horizontalLinesSettings", "id", "reactionClickSettings", "selectedGame", "shop", "updatedAt") SELECT "bouncingBallSettings", "createdAt", "emailRequired", "enabled", "horizontalLinesSettings", "id", "reactionClickSettings", "selectedGame", "shop", "updatedAt" FROM "GameSettings";
DROP TABLE "GameSettings";
ALTER TABLE "new_GameSettings" RENAME TO "GameSettings";
CREATE UNIQUE INDEX "GameSettings_shop_key" ON "GameSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
