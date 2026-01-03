-- Add perGameSettings JSON column
ALTER TABLE "GameSettings" ADD COLUMN "perGameSettings" TEXT;

-- Migrate existing data to JSON format
-- Create default JSON structure for all games with existing values
UPDATE "GameSettings" SET "perGameSettings" = json_object(
  'bouncing-ball', json_object(
    'backgroundColor', COALESCE("backgroundColor", '#ffffff'),
    'ballColor', COALESCE("ballColor", '#000000'),
    'obstacleColor', COALESCE("obstacleColor", '#ff0000'),
    'popupText', COALESCE("popupText", 'Discount Game'),
    'borderRadius', COALESCE("borderRadius", 10),
    'gameDifficulty', COALESCE("gameDifficulty", 50)
  ),
  'horizontal-lines', json_object(
    'backgroundColor', COALESCE("backgroundColor", '#ffffff'),
    'ballColor', COALESCE("ballColor", '#000000'),
    'obstacleColor', COALESCE("obstacleColor", '#ff0000'),
    'popupText', COALESCE("popupText", 'Discount Game'),
    'borderRadius', COALESCE("borderRadius", 10),
    'gameDifficulty', COALESCE("gameDifficulty", 50)
  ),
  'reaction-click', json_object(
    'backgroundColor', COALESCE("backgroundColor", '#021412'),
    'ballColor', COALESCE("ballColor", '#00ce90'),
    'popupText', COALESCE("popupText", 'Discount Game'),
    'borderRadius', COALESCE("borderRadius", 10),
    'gameDifficulty', COALESCE("gameDifficulty", 50)
  )
);

-- Set default for any NULL values
UPDATE "GameSettings" SET "perGameSettings" = json_object(
  'bouncing-ball', json_object(
    'backgroundColor', '#ffffff',
    'ballColor', '#000000',
    'obstacleColor', '#ff0000',
    'popupText', 'Discount Game',
    'borderRadius', 10,
    'gameDifficulty', 50
  ),
  'horizontal-lines', json_object(
    'backgroundColor', '#ffffff',
    'ballColor', '#000000',
    'obstacleColor', '#ff0000',
    'popupText', 'Discount Game',
    'borderRadius', 10,
    'gameDifficulty', 50
  ),
  'reaction-click', json_object(
    'backgroundColor', '#021412',
    'ballColor', '#00ce90',
    'popupText', 'Discount Game',
    'borderRadius', 10,
    'gameDifficulty', 50
  )
) WHERE "perGameSettings" IS NULL;

-- Drop old columns
CREATE TABLE "GameSettings_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "selectedGame" TEXT NOT NULL DEFAULT 'bouncing-ball',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "emailRequired" BOOLEAN NOT NULL DEFAULT true,
    "perGameSettings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data to new table
INSERT INTO "GameSettings_new" ("id", "shop", "selectedGame", "enabled", "emailRequired", "perGameSettings", "createdAt", "updatedAt")
SELECT "id", "shop", "selectedGame", "enabled", "emailRequired", "perGameSettings", "createdAt", "updatedAt"
FROM "GameSettings";

-- Drop old table and rename new one
DROP TABLE "GameSettings";
ALTER TABLE "GameSettings_new" RENAME TO "GameSettings";

-- Recreate unique index
CREATE UNIQUE INDEX "GameSettings_shop_key" ON "GameSettings"("shop");





