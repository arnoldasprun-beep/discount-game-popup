#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Configuration for each environment
const configs = {
  production: {
    clientId: '6ad96fb3e2b676eae966d76070817c08',
    name: 'Discount Game Popup',
    applicationUrl: 'https://discount-game-popup-production.up.railway.app',
    appUrl: 'https://discount-game-popup-production.up.railway.app',
    dbProvider: 'mysql',
    dbUrl: 'env("DATABASE_URL")',
    dbUrlEnv: 'mysql://root:GvwxgipzusuJxHRIZvJJSuvyldRfGQHD@shinkansen.proxy.rlwy.net:38592/railway',
  },
  local: {
    clientId: 'e29ac76f642703b2360d69d99a9dbba3',
    name: 'Trial',
    applicationUrl: 'https://trialapp.traffishow.com',
    appUrl: 'https://trialapp.traffishow.com',
    dbProvider: 'sqlite',
    dbUrl: '"file:./dev.sqlite"',
    dbUrlEnv: 'file:./prisma/dev.sqlite',
  },
};

// Files to update
const filesToUpdate = [
  {
    path: 'shopify.app.toml',
    replacements: [
      {
        pattern: /client_id = ".*"/,
        replacement: (config) => `client_id = "${config.clientId}"`,
      },
      {
        pattern: /name = ".*"/,
        replacement: (config) => `name = "${config.name}"`,
      },
      {
        pattern: /application_url = ".*"/,
        replacement: (config) => `application_url = "${config.applicationUrl}"`,
      },
      {
        pattern: /redirect_urls = \[\s*"[^"]*"/,
        replacement: (config) => `redirect_urls = [\n  "${config.applicationUrl}/api/auth"`,
      },
    ],
  },
  {
    path: 'extensions/game-popup/blocks/game-popup.liquid',
    replacements: [
      {
        pattern: /const appUrl = '[^']*';/,
        replacement: (config) => `const appUrl = '${config.appUrl}';`,
      },
    ],
  },
  {
    path: 'public/games/horizontal-lines/game.js',
    replacements: [
      {
        pattern: /this\.appUrl = '[^']*';/,
        replacement: (config) => `this.appUrl = '${config.appUrl}';`,
      },
    ],
  },
  {
    path: 'public/games/bouncing-ball/game.js',
    replacements: [
      {
        pattern: /this\.appUrl = '[^']*';/,
        replacement: (config) => `this.appUrl = '${config.appUrl}';`,
      },
    ],
  },
  {
    path: 'public/games/reaction-click/game.js',
    replacements: [
      {
        pattern: /this\.appUrl = '[^']*';/,
        replacement: (config) => `this.appUrl = '${config.appUrl}';`,
      },
    ],
  },
  {
    path: 'prisma/schema.prisma',
    replacements: [
      {
        pattern: /provider = "mysql"|provider = "sqlite"/,
        replacement: (config) => `provider = "${config.dbProvider}"`,
      },
      {
        pattern: /url\s*=\s*env\("DATABASE_URL"\)|url\s*=\s*"file:\.\/dev\.sqlite"|url\s*=\s*"file:\.\/prisma\/dev\.sqlite"/,
        replacement: (config) => `url      = ${config.dbUrl}`,
      },
    ],
  },
  {
    path: 'prisma/migrations/migration_lock.toml',
    replacements: [
      {
        pattern: /provider = "mysql"|provider = "sqlite"/,
        replacement: (config) => `provider = "${config.dbProvider}"`,
      },
    ],
  },
];

function detectCurrentMode() {
  try {
    const tomlPath = join(rootDir, 'shopify.app.toml');
    const content = readFileSync(tomlPath, 'utf8');
    
    if (content.includes('discount-game-popup-production.up.railway.app')) {
      return 'production';
    } else if (content.includes('trialapp.traffishow.com')) {
      return 'local';
    }
  } catch (error) {
    console.error('Error detecting current mode:', error.message);
  }
  return null;
}

function updateEnvFile(targetMode, config) {
  const envPath = join(rootDir, '.env');
  
  let envContent = '';
  
  // Read existing .env if it exists
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  }
  
  // Check if DATABASE_URL already exists
  const dbUrlPattern = /^DATABASE_URL=.*$/m;
  const dbUrlValue = config.dbUrlEnv;
  
  if (dbUrlPattern.test(envContent)) {
    // Update existing DATABASE_URL
    envContent = envContent.replace(dbUrlPattern, `DATABASE_URL="${dbUrlValue}"`);
  } else {
    // Add DATABASE_URL (add newline if file has content)
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `DATABASE_URL="${dbUrlValue}"\n`;
  }
  
  // Write back to file
  writeFileSync(envPath, envContent, 'utf8');
  return true;
}

function switchEnvironment(targetMode) {
  const config = configs[targetMode];
  if (!config) {
    console.error(`Invalid mode: ${targetMode}. Use 'production' or 'local'.`);
    process.exit(1);
  }

  console.log(`\n🔄 Switching to ${targetMode.toUpperCase()} mode...\n`);

  let updatedCount = 0;

  for (const file of filesToUpdate) {
    const filePath = join(rootDir, file.path);
    
    try {
      let content = readFileSync(filePath, 'utf8');
      let fileModified = false;

      for (const replacement of file.replacements) {
        const newContent = content.replace(
          replacement.pattern,
          replacement.replacement(config)
        );
        
        if (newContent !== content) {
          content = newContent;
          fileModified = true;
        }
      }

      if (fileModified) {
        writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${file.path}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No changes needed: ${file.path}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${file.path}:`, error.message);
    }
  }

  // Update .env file
  let envUpdated = false;
  try {
    envUpdated = updateEnvFile(targetMode, config);
    if (envUpdated) {
      const dbType = targetMode === 'local' ? 'SQLite' : 'MySQL';
      console.log(`✅ Updated: .env (DATABASE_URL set to ${dbType})`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`⚠️  Warning: Could not update .env file: ${error.message}`);
  }

  console.log(`\n✨ Done! Updated ${updatedCount} file(s).`);
  console.log(`\n📋 Configuration:`);
  console.log(`   Client ID: ${config.clientId}`);
  console.log(`   Name: ${config.name}`);
  console.log(`   Application URL: ${config.applicationUrl}`);
  console.log(`   App URL: ${config.appUrl}`);
  console.log(`   Database Provider: ${config.dbProvider.toUpperCase()}`);
  
  if (targetMode === 'local') {
    console.log(`\n💡 Next step:`);
    console.log(`   Run: npx prisma db push`);
    console.log(`   (This will create/update your local SQLite database)`);
  } else {
    console.log(`\n💡 Remember:`);
    console.log(`   - DATABASE_URL should be set in Railway environment variables`);
    console.log(`   - Railway will run 'prisma db push' automatically on deploy`);
  }
  console.log('');
}

// Main execution
const args = process.argv.slice(2);
const targetMode = args[0]?.toLowerCase();

if (targetMode && ['production', 'local', 'prod', 'dev'].includes(targetMode)) {
  // Explicit mode specified
  const mode = targetMode === 'prod' ? 'production' : targetMode === 'dev' ? 'local' : targetMode;
  switchEnvironment(mode);
} else if (targetMode) {
  // Invalid mode
  console.error(`Invalid mode: ${targetMode}`);
  console.log('\nUsage:');
  console.log('  node scripts/switch-env.js [production|local|prod|dev]');
  console.log('  npm run switch:env [production|local|prod|dev]');
  console.log('\nIf no mode is specified, it will switch to the opposite of the current mode.');
  process.exit(1);
} else {
  // Auto-detect and switch
  const currentMode = detectCurrentMode();
  
  if (!currentMode) {
    console.error('Could not detect current environment mode.');
    console.log('\nPlease specify the mode explicitly:');
    console.log('  node scripts/switch-env.js production');
    console.log('  node scripts/switch-env.js local');
    process.exit(1);
  }

  const oppositeMode = currentMode === 'production' ? 'local' : 'production';
  console.log(`Current mode: ${currentMode.toUpperCase()}`);
  switchEnvironment(oppositeMode);
}
