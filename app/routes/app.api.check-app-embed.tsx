import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const APP_EXTENSION_UID = "be1f0407-3e6c-c935-6a31-d8540964d8b7a1dbd5cf";

// Export the function so it can be reused
export async function checkAppEmbedViaThemeSettings(admin: any, session: any): Promise<{ success: boolean; debug?: string; debugDetails?: any }> {
  try {
    // Step 1: Get active theme ID via GraphQL
    const themeResponse = await admin.graphql(`
      query {
        themes(first: 10) {
          edges {
            node {
              id
              role
            }
          }
        }
      }
    `);

    const themeData = await themeResponse.json();
    // Find the main theme (role: MAIN)
    const mainTheme = themeData?.data?.themes?.edges?.find(
      (edge: any) => edge.node.role === 'MAIN'
    );
    const themeId = mainTheme?.node?.id;
    
    if (!themeId) {
      const debug = `No main theme found. Available themes: ${JSON.stringify(themeData?.data?.themes?.edges?.map((e: any) => e.node.role))}`;
      return { success: false, debug };
    }

    // Extract numeric ID from "gid://shopify/Theme/123456"
    const themeIdNum = themeId.split('/').pop();

    // Step 2: Fetch settings_data.json from theme assets using REST API
    const restResponse = await fetch(
      `https://${session.shop}/admin/api/2025-10/themes/${themeIdNum}/assets.json?asset[key]=config/settings_data.json`,
      {
        headers: {
          'X-Shopify-Access-Token': session.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!restResponse.ok) {
      const debug = `Failed to fetch settings_data.json: HTTP ${restResponse.status}`;
      return { success: false, debug };
    }

    const assetData = await restResponse.json();
    const settingsJson = assetData?.asset?.value;

    if (!settingsJson) {
      const debug = 'settings_data.json is empty or missing';
      return { success: false, debug };
    }

    // Step 3: Parse JSON and check for app embed
    const settings = JSON.parse(settingsJson);
    
    // Get top-level keys for debug info
    const topLevelKeys = Object.keys(settings || {});
    
    // App embeds can be stored in multiple places:
    // 1. current.app_embeds (older structure)
    // 2. current.blocks (newer structure - blocks with type containing app embed)
    const appEmbeds = settings?.current?.app_embeds || {};
    const embedKeys = Object.keys(appEmbeds);
    
    // Check blocks for app embed blocks
    const blocks = settings?.current?.blocks || {};
    const blockKeys = Object.keys(blocks);
    
    // Look for blocks with type matching our app embed
    // Format: "shopify://apps/{app_name}/blocks/{block_type}/{uid}"
    // App embed blocks have type like: "shopify://apps/game-popup/blocks/app-embed/{uid}"
    const allBlocks = Object.entries(blocks);
    
    // Look for blocks that match our extension
    // Check for game-popup in the type, or app-embed blocks that might be ours
    const appEmbedBlocks = allBlocks.filter(([key, block]: [string, any]) => {
      const blockType = (block?.type || '').toLowerCase();
      // Match if type contains game-popup or our extension UID
      return blockType.includes('game-popup') || 
             blockType.includes(APP_EXTENSION_UID.toLowerCase());
    });
    
    // Check if any matching block is enabled (disabled must be false or undefined)
    const enabledBlocks = appEmbedBlocks.filter(([key, block]: [string, any]) => {
      // Block is enabled if disabled is explicitly false or undefined
      const isEnabled = block?.disabled === false || block?.disabled === undefined;
      return isEnabled;
    });
    
    if (enabledBlocks.length > 0) {
      return { success: true };
    } else if (appEmbedBlocks.length > 0) {
      // Found our blocks but they're all disabled
      
      const debugDetails = {
        topLevelKeys: topLevelKeys.join(', '),
        currentKeys: settings?.current ? Object.keys(settings.current).join(', ') : 'none',
        blocksCount: allBlocks.length,
        appEmbedBlocksFound: appEmbedBlocks.length,
        enabledBlocksFound: 0,
        extensionUID: APP_EXTENSION_UID,
        hint: 'App embed blocks found but all are disabled. Enable the app embed in theme editor.'
      };
      
      return { 
        success: false, 
        debug: `App embed blocks found but disabled. Block count: ${appEmbedBlocks.length}`,
        debugDetails
      };
    }
    
    // Also check old app_embeds structure
    const allAppEmbeds = settings?.app_embeds || settings?.current?.app_embeds || {};
    const allEmbedKeys = Object.keys(allAppEmbeds);
    
    const extensionKey = allEmbedKeys.find(key => 
      key.includes(APP_EXTENSION_UID) || 
      key === APP_EXTENSION_UID ||
      key.toLowerCase().includes('game-popup')
    );
    
    if (extensionKey) {
      const embedConfig = allAppEmbeds[extensionKey];
      const isEnabled = embedConfig === true || embedConfig?.enabled === true;
      if (isEnabled) {
        return { success: true };
      }
    }

    // Create detailed debug info
    const currentKeys = settings?.current ? Object.keys(settings.current).join(', ') : 'none';
    const blockCount = blockKeys.length;
    const appEmbedBlockCount = appEmbedBlocks.length;
    const enabledBlockCount = enabledBlocks.length;
    
    const debugDetails = {
      topLevelKeys: topLevelKeys.join(', '),
      currentKeys: currentKeys,
      blocksCount: blockCount,
      appEmbedBlocksFound: appEmbedBlockCount,
      enabledBlocksFound: enabledBlockCount,
      extensionUID: APP_EXTENSION_UID,
      hint: appEmbedBlockCount > 0 
        ? 'App embed blocks found but all are disabled. Enable the app embed in theme editor.'
        : 'App embed not found in blocks. Check if extension is deployed and theme is saved after enabling.'
    };
    
    const debug = appEmbedBlockCount > 0
      ? `App embed blocks found (${appEmbedBlockCount}) but all disabled. Blocks checked: ${blockCount}`
      : `Extension UID not found. Blocks checked: ${blockCount}, app embed blocks: ${appEmbedBlockCount}`;
    
    return { success: false, debug, debugDetails };
  } catch (error: any) {
    const debug = `Error: ${error.message || String(error)}`;
    console.error(`[Auto-detect] ${debug}`);
    return { success: false, debug };
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Try Method 1: Check theme settings_data.json
  const themeCheck = await checkAppEmbedViaThemeSettings(admin, session);
  
  if (themeCheck.success) {
    // Auto-update database when detected as enabled
    await prisma.gameSettings.upsert({
      where: { shop: session.shop },
      update: { appEmbedEnabled: true },
      create: { 
        shop: session.shop, 
        appEmbedEnabled: true,
        selectedGame: "bouncing-ball",
        enabled: true,
      },
    });
    
    return Response.json({ appEmbedEnabled: true });
  }

  // Theme check failed - check if blocks were found but disabled
  const blocksFoundButDisabled = themeCheck.debug?.includes('blocks found but disabled') || 
                                  themeCheck.debugDetails?.appEmbedBlocksFound > 0;

  if (blocksFoundButDisabled) {
    // Update database to reflect disabled state
    await prisma.gameSettings.upsert({
      where: { shop: session.shop },
      update: { appEmbedEnabled: false },
      create: { 
        shop: session.shop, 
        appEmbedEnabled: false,
        selectedGame: "bouncing-ball",
        enabled: true,
      },
    });
    
    return Response.json({
      appEmbedEnabled: false,
      debug: themeCheck.debug || 'App embed blocks found but disabled',
      ...(themeCheck.debugDetails && { debugDetails: themeCheck.debugDetails })
    });
  }

  // Fallback: Check database (for cases where theme check completely failed)
  const settings = await prisma.gameSettings.findUnique({
    where: { shop: session.shop },
    select: { appEmbedEnabled: true },
  });

  const result = {
    appEmbedEnabled: settings?.appEmbedEnabled ?? false,
    debug: themeCheck.debug || 'Unknown error during theme check',
    ...(themeCheck.debugDetails && { debugDetails: themeCheck.debugDetails })
  };

  return Response.json(result);
};
