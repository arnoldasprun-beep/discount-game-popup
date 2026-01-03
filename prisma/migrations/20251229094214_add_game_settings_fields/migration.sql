-- AlterTable
ALTER TABLE "GameSettings" ADD COLUMN "backgroundColor" TEXT DEFAULT '#ffffff';
ALTER TABLE "GameSettings" ADD COLUMN "ballColor" TEXT DEFAULT '#000000';
ALTER TABLE "GameSettings" ADD COLUMN "borderRadius" INTEGER DEFAULT 10;
ALTER TABLE "GameSettings" ADD COLUMN "gameDifficulty" INTEGER DEFAULT 50;
ALTER TABLE "GameSettings" ADD COLUMN "obstacleColor" TEXT DEFAULT '#ff0000';
ALTER TABLE "GameSettings" ADD COLUMN "popupText" TEXT DEFAULT 'Discount Game';
