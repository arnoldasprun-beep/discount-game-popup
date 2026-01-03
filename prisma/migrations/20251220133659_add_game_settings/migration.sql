-- CreateTable
CREATE TABLE "GameSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "selectedGame" TEXT NOT NULL DEFAULT 'bouncing-ball',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "emailRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSettings_shop_key" ON "GameSettings"("shop");
