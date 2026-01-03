-- Add new separate JSON fields for each game
ALTER TABLE "GameSettings" ADD COLUMN "bouncingBallSettings" TEXT;
ALTER TABLE "GameSettings" ADD COLUMN "horizontalLinesSettings" TEXT;
ALTER TABLE "GameSettings" ADD COLUMN "reactionClickSettings" TEXT;

-- Migrate data from perGameSettings to separate fields
-- Extract each game's settings from the JSON
UPDATE "GameSettings" SET 
  "bouncingBallSettings" = json_extract("perGameSettings", '$.bouncing-ball'),
  "horizontalLinesSettings" = json_extract("perGameSettings", '$.horizontal-lines'),
  "reactionClickSettings" = json_extract("perGameSettings", '$.reaction-click')
WHERE "perGameSettings" IS NOT NULL;

-- Set defaults for any NULL values
UPDATE "GameSettings" SET 
  "bouncingBallSettings" = json_object(
    'backgroundColor', '#ffffff',
    'ballColor', '#000000',
    'obstacleColor', '#ff0000',
    'popupText', 'Discount Game',
    'borderRadius', 10,
    'gameDifficulty', 50
  )
WHERE "bouncingBallSettings" IS NULL;

UPDATE "GameSettings" SET 
  "horizontalLinesSettings" = json_object(
    'backgroundColor', '#ffffff',
    'ballColor', '#000000',
    'obstacleColor', '#ff0000',
    'popupText', 'Discount Game',
    'borderRadius', 10,
    'gameDifficulty', 50
  )
WHERE "horizontalLinesSettings" IS NULL;

UPDATE "GameSettings" SET 
  "reactionClickSettings" = json_object(
    'backgroundColor', '#021412',
    'ballColor', '#00ce90',
    'popupText', 'Discount Game',
    'borderRadius', 10,
    'gameDifficulty', 50
  )
WHERE "reactionClickSettings" IS NULL;

-- Drop the old perGameSettings column
CREATE TABLE "GameSettings_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "selectedGame" TEXT NOT NULL DEFAULT 'bouncing-ball',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "emailRequired" BOOLEAN NOT NULL DEFAULT true,
    "bouncingBallSettings" TEXT,
    "horizontalLinesSettings" TEXT,
    "reactionClickSettings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data to new table
INSERT INTO "GameSettings_new" (
    "id", "shop", "selectedGame", "enabled", "emailRequired", 
    "bouncingBallSettings", "horizontalLinesSettings", "reactionClickSettings",
    "createdAt", "updatedAt"
)
SELECT 
    "id", "shop", "selectedGame", "enabled", "emailRequired",
    "bouncingBallSettings", "horizontalLinesSettings", "reactionClickSettings",
    "createdAt", "updatedAt"
FROM "GameSettings";

-- Drop old table and rename new one
DROP TABLE "GameSettings";
ALTER TABLE "GameSettings_new" RENAME TO "GameSettings";

-- Recreate unique index
CREATE UNIQUE INDEX "GameSettings_shop_key" ON "GameSettings"("shop");







