-- AlterTable
ALTER TABLE "DiscountClaim" ADD COLUMN "device" TEXT;
ALTER TABLE "DiscountClaim" ADD COLUMN "gameType" TEXT;

-- CreateTable
CREATE TABLE "PopupView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GamePlay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PopupView_shop_idx" ON "PopupView"("shop");

-- CreateIndex
CREATE INDEX "PopupView_sessionId_idx" ON "PopupView"("sessionId");

-- CreateIndex
CREATE INDEX "GamePlay_shop_idx" ON "GamePlay"("shop");

-- CreateIndex
CREATE INDEX "GamePlay_sessionId_idx" ON "GamePlay"("sessionId");
