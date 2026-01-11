import type { LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";

// CORS headers for cross-origin requests from storefront
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Handle OPTIONS preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return Response.json(
        { error: "Shop parameter is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch settings from database
    const settings = await prisma.gameSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      // Return default settings if none exist
      // Note: Settings should be created by onboarding/check-app-embed before API is called
      // But return enabled: true as default so popup can show if settings exist elsewhere
      return Response.json(
        {
          enabled: true,
          selectedGame: "horizontal-lines",
          requireEmailToClaim: true,
          requireName: false,
        },
        { headers: corsHeaders }
      );
    }

    // Get per-game settings based on selected game
    const selectedGame = settings.selectedGame || "horizontal-lines";
    let gameSettings = {};

    if (selectedGame === "horizontal-lines" && settings.horizontalLinesSettings) {
      gameSettings = settings.horizontalLinesSettings as any;
    } else if (selectedGame === "bouncing-ball" && settings.bouncingBallSettings) {
      gameSettings = settings.bouncingBallSettings as any;
    } else if (selectedGame === "reaction-click" && settings.reactionClickSettings) {
      gameSettings = settings.reactionClickSettings as any;
    }

    // Merge base settings with per-game settings
    const response = {
      enabled: settings.enabled,
      selectedGame: settings.selectedGame,
      requireEmailToClaim: settings.emailRequired,
      requireName: settings.requireName,
      popupDelay: settings.popupDelay || '0',
      popupText: gameSettings.popupText || "Discount Game",
      mainText: gameSettings.mainText || "Discount Game",
      mainTextColor: gameSettings.mainTextColor || "#000000",
      mainTextSize: gameSettings.mainTextSize || "24",
      mainTextBgColor: gameSettings.mainTextBgColor || "#ffffff",
      mainTextWeight: gameSettings.mainTextWeight || "600",
      borderRadius: gameSettings.borderRadius ?? 10,
      gameEndBorderRadius: gameSettings.gameEndBorderRadius ?? 10,
      emailModalBorderRadius: gameSettings.emailModalBorderRadius ?? 10,
      discountModalBorderRadius: gameSettings.discountModalBorderRadius ?? 10,
      backgroundColor: gameSettings.backgroundColor || "#ffffff",
      ballColor: gameSettings.ballColor || "#000000",
      obstacleColor: gameSettings.obstacleColor || "#ff0000",
      gameDifficulty: gameSettings.gameDifficulty ?? 50,
      maxDiscount: gameSettings.maxDiscount || "100",
      countdownTime: gameSettings.countdownTime ?? 10,
      claimBestButtonText: gameSettings.claimBestButtonText || "Claim Best Discount",
      claimBestButtonTextColor: gameSettings.claimBestButtonTextColor || "#ffffff",
      claimBestButtonTextSize: gameSettings.claimBestButtonTextSize || "16",
      claimBestButtonTextWeight: gameSettings.claimBestButtonTextWeight || "500",
      gameEndTabBgColor: gameSettings.gameEndTabBgColor || "#ffffff",
      buttonBgColor: gameSettings.buttonBgColor || "#000000",
      claimBestButtonBgColor: gameSettings.claimBestButtonBgColor || "#000000",
      logoUrl: settings.logoUrl || null,
      logoUrlMobile: settings.logoUrlMobile || null,
      logoScale: settings.logoScale ?? 100,
      logoScaleMobile: settings.logoScaleMobile ?? 100,
      logoHeightDesktop: settings.logoHeightDesktop ?? 'small',
      logoHeightMobile: settings.logoHeightMobile ?? 'small',
      popupDisplayPage: settings.popupDisplayPage || 'any',
      popupCustomUrls: settings.popupCustomUrls || [],
      showStickyButton: settings.showStickyButton,
      stickyButtonText: settings.stickyButtonText,
      stickyButtonColor: settings.stickyButtonColor,
      stickyButtonTextColor: settings.stickyButtonTextColor,
      stickyButtonPosition: settings.stickyButtonPosition,
      stickyButtonDisplayPage: settings.stickyButtonDisplayPage || 'any',
      stickyButtonCustomUrls: settings.stickyButtonCustomUrls || [],
      stickyButtonShowOnDesktop: settings.stickyButtonShowOnDesktop,
      stickyButtonShowOnMobile: settings.stickyButtonShowOnMobile,
      showPopupHeaderText: settings.showPopupHeaderText !== undefined ? settings.showPopupHeaderText : true,
      // Add all other text settings that the popup expects
      secondaryText: gameSettings.secondaryText,
      secondaryTextColor: gameSettings.secondaryTextColor,
      secondaryTextSize: gameSettings.secondaryTextSize,
      secondaryTextWeight: gameSettings.secondaryTextWeight,
      rulesText: gameSettings.rulesText,
      rulesTextColor: gameSettings.rulesTextColor,
      rulesTextSize: gameSettings.rulesTextSize,
      rulesTextWeight: gameSettings.rulesTextWeight,
      instructionText: gameSettings.instructionText,
      instructionTextColor: gameSettings.instructionTextColor,
      instructionTextSize: gameSettings.instructionTextSize,
      instructionTextWeight: gameSettings.instructionTextWeight,
      gameEndText: gameSettings.gameEndText,
      gameEndTextColor: gameSettings.gameEndTextColor,
      gameEndTextSize: gameSettings.gameEndTextSize,
      gameEndTextWeight: gameSettings.gameEndTextWeight,
      buttonText: gameSettings.buttonText,
      buttonTextColor: gameSettings.buttonTextColor,
      buttonTextSize: gameSettings.buttonTextSize,
      buttonTextWeight: gameSettings.buttonTextWeight,
      emailModalHeadingText: gameSettings.emailModalHeadingText,
      emailModalHeadingColor: gameSettings.emailModalHeadingColor,
      emailModalHeadingSize: gameSettings.emailModalHeadingSize,
      emailModalHeadingWeight: gameSettings.emailModalHeadingWeight,
      emailModalDescriptionText: gameSettings.emailModalDescriptionText,
      emailModalDescriptionColor: gameSettings.emailModalDescriptionColor,
      emailModalDescriptionSize: gameSettings.emailModalDescriptionSize,
      emailModalDescriptionWeight: gameSettings.emailModalDescriptionWeight,
      emailModalSubmitText: gameSettings.emailModalSubmitText,
      emailModalSubmitColor: gameSettings.emailModalSubmitColor,
      emailModalSubmitSize: gameSettings.emailModalSubmitSize,
      emailModalSubmitWeight: gameSettings.emailModalSubmitWeight,
      emailModalCancelText: gameSettings.emailModalCancelText,
      emailModalCancelColor: gameSettings.emailModalCancelColor,
      emailModalCancelSize: gameSettings.emailModalCancelSize,
      emailModalCancelWeight: gameSettings.emailModalCancelWeight,
      emailModalBgColor: gameSettings.emailModalBgColor,
      emailModalSubmitBgColor: gameSettings.emailModalSubmitBgColor,
      emailModalCancelBgColor: gameSettings.emailModalCancelBgColor,
      discountModalHeadingText: gameSettings.discountModalHeadingText,
      discountModalHeadingColor: gameSettings.discountModalHeadingColor,
      discountModalHeadingSize: gameSettings.discountModalHeadingSize,
      discountModalHeadingWeight: gameSettings.discountModalHeadingWeight,
      discountModalDescriptionText: gameSettings.discountModalDescriptionText,
      discountModalDescriptionColor: gameSettings.discountModalDescriptionColor,
      discountModalDescriptionSize: gameSettings.discountModalDescriptionSize,
      discountModalDescriptionWeight: gameSettings.discountModalDescriptionWeight,
      discountModalCloseText: gameSettings.discountModalCloseText,
      discountModalCloseColor: gameSettings.discountModalCloseColor,
      discountModalCloseSize: gameSettings.discountModalCloseSize,
      discountModalCloseWeight: gameSettings.discountModalCloseWeight,
      discountModalBgColor: gameSettings.discountModalBgColor,
      discountModalCloseBgColor: gameSettings.discountModalCloseBgColor,
    };

    return Response.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500, headers: corsHeaders }
    );
  }
};

