import type { LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";

// CORS headers for cross-origin requests from storefront
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS preflight requests
export const options = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get shop from query parameter (theme extension will pass this)
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return Response.json(
      { error: "Shop parameter required" }, 
      { 
        status: 400,
        headers: corsHeaders,
      }
    );
  }
  
  // Default settings for each game
  const defaultBouncingBall = {
    backgroundColor: "#ffffff",
    ballColor: "#000000",
    obstacleColor: "#ff0000",
    popupText: "Discount Game",
    borderRadius: 10,
    gameEndBorderRadius: 10,
    emailModalBorderRadius: 10,
    discountModalBorderRadius: 10,
    gameDifficulty: 50,
    maxDiscount: "100",
    mainText: "Discount Game",
    mainTextSize: "24",
    mainTextColor: "#000000",
    mainTextBgColor: "#ffffff",
    mainTextWeight: "600",
    secondaryText: "Discount:",
    secondaryTextColor: "#000000",
    secondaryTextSize: "18",
    secondaryTextWeight: "400",
    rulesText: "1 Score - 1% Discount",
    rulesTextColor: "#000000",
    rulesTextSize: "14",
    rulesTextWeight: "400",
    instructionText: "Click to Bounce",
    instructionTextColor: "#000000",
    instructionTextSize: "16",
    instructionTextWeight: "400",
    gameEndText: "Your Discount",
    gameEndTextColor: "#000000",
    gameEndTextSize: "20",
    gameEndTextWeight: "400",
    buttonText: "Play Again",
    buttonTextColor: "#ffffff",
    buttonTextSize: "16",
    buttonTextWeight: "500",
    claimBestButtonText: "Claim Best Discount",
    claimBestButtonTextColor: "#ffffff",
    claimBestButtonTextSize: "16",
    claimBestButtonTextWeight: "500",
    claimBestButtonBgColor: "#000000",
    // Email Modal Settings
    emailModalHeadingText: "Enter Your Email",
    emailModalHeadingColor: "#333333",
    emailModalHeadingSize: "20",
    emailModalHeadingWeight: "600",
    emailModalDescriptionText: "Please enter your email to claim your discount:",
    emailModalDescriptionColor: "#333333",
    emailModalDescriptionSize: "14",
    emailModalDescriptionWeight: "400",
    emailModalSubmitText: "Submit",
    emailModalSubmitColor: "#ffffff",
    emailModalSubmitSize: "16",
    emailModalSubmitWeight: "500",
    emailModalCancelText: "Cancel",
    emailModalCancelColor: "#333333",
    emailModalCancelSize: "16",
    emailModalCancelWeight: "500",
    emailModalBgColor: "#ffffff",
    emailModalSubmitBgColor: "#000000",
    emailModalCancelBgColor: "#cccccc",
    // Discount Code Modal Settings
    discountModalHeadingText: "Your Discount Code",
    discountModalHeadingColor: "#333333",
    discountModalHeadingSize: "20",
    discountModalHeadingWeight: "600",
    discountModalCodeColor: "#333333",
    discountModalCodeSize: "18",
    discountModalCodeWeight: "600",
    discountModalCloseText: "Close",
    discountModalCloseColor: "#ffffff",
    discountModalCloseSize: "16",
    discountModalCloseWeight: "500",
    discountModalBgColor: "#ffffff",
    discountModalCloseBgColor: "#000000",
    discountModalDescriptionText: "Copy your code and use it at checkout",
    discountModalDescriptionColor: "#333333",
    discountModalDescriptionSize: "14",
    discountModalDescriptionWeight: "400",
  };

  const defaultHorizontalLines = {
    backgroundColor: "#ffffff",
    ballColor: "#000000",
    obstacleColor: "#ff0000",
    popupText: "Discount Game",
    borderRadius: 10,
    gameEndBorderRadius: 10,
    emailModalBorderRadius: 10,
    discountModalBorderRadius: 10,
    gameDifficulty: 50,
    maxDiscount: "100",
    mainText: "Discount Game",
    mainTextSize: "24",
    mainTextColor: "#000000",
    mainTextBgColor: "#ffffff",
    mainTextWeight: "600",
    secondaryText: "Discount:",
    secondaryTextColor: "#000000",
    secondaryTextSize: "18",
    secondaryTextWeight: "400",
    rulesText: "1 Score - 1% Discount",
    rulesTextColor: "#000000",
    rulesTextSize: "14",
    rulesTextWeight: "400",
    instructionText: "Move left or right",
    instructionTextColor: "#000000",
    instructionTextSize: "16",
    instructionTextWeight: "400",
    gameEndText: "Your Discount",
    gameEndTextColor: "#000000",
    gameEndTextSize: "20",
    gameEndTextWeight: "400",
    buttonText: "Play Again",
    buttonTextColor: "#ffffff",
    buttonTextSize: "16",
    buttonTextWeight: "500",
    claimBestButtonText: "Claim Best Discount",
    claimBestButtonTextColor: "#ffffff",
    claimBestButtonTextSize: "16",
    claimBestButtonTextWeight: "500",
    claimBestButtonBgColor: "#000000",
    // Email Modal Settings
    emailModalHeadingText: "Enter Your Email",
    emailModalHeadingColor: "#333333",
    emailModalHeadingSize: "20",
    emailModalHeadingWeight: "600",
    emailModalDescriptionText: "Please enter your email to claim your discount:",
    emailModalDescriptionColor: "#333333",
    emailModalDescriptionSize: "14",
    emailModalDescriptionWeight: "400",
    emailModalSubmitText: "Submit",
    emailModalSubmitColor: "#ffffff",
    emailModalSubmitSize: "16",
    emailModalSubmitWeight: "500",
    emailModalCancelText: "Cancel",
    emailModalCancelColor: "#333333",
    emailModalCancelSize: "16",
    emailModalCancelWeight: "500",
    emailModalBgColor: "#ffffff",
    emailModalSubmitBgColor: "#000000",
    emailModalCancelBgColor: "#cccccc",
    // Discount Code Modal Settings
    discountModalHeadingText: "Your Discount Code",
    discountModalHeadingColor: "#333333",
    discountModalHeadingSize: "20",
    discountModalHeadingWeight: "600",
    discountModalCodeColor: "#333333",
    discountModalCodeSize: "18",
    discountModalCodeWeight: "600",
    discountModalCloseText: "Close",
    discountModalCloseColor: "#ffffff",
    discountModalCloseSize: "16",
    discountModalCloseWeight: "500",
      discountModalBgColor: "#ffffff",
      discountModalCloseBgColor: "#000000",
      discountModalDescriptionText: "Copy your code and use it at checkout",
      discountModalDescriptionColor: "#333333",
      discountModalDescriptionSize: "14",
      discountModalDescriptionWeight: "400",
    };

  const defaultReactionClick = {
    backgroundColor: "#021412",
    ballColor: "#00ce90",
    popupText: "Discount Game",
    borderRadius: 10,
    gameEndBorderRadius: 10,
    emailModalBorderRadius: 10,
    discountModalBorderRadius: 10,
    gameDifficulty: 50,
    maxDiscount: "100",
    countdownTime: 10,
    mainText: "Discount Game",
    mainTextSize: "24",
    mainTextColor: "#000000",
    mainTextBgColor: "#ffffff",
    mainTextWeight: "600",
    secondaryText: "Discount:",
    secondaryTextColor: "#000000",
    secondaryTextSize: "18",
    secondaryTextWeight: "400",
    rulesText: "1 Score - 1% Discount",
    rulesTextColor: "#000000",
    rulesTextSize: "14",
    rulesTextWeight: "400",
    instructionText: "Click to Start",
    instructionTextColor: "#000000",
    instructionTextSize: "16",
    instructionTextWeight: "400",
      gameEndText: "Your Discount",
      gameEndTextColor: "#000000",
      gameEndTextSize: "20",
      gameEndTextWeight: "400",
      buttonText: "Play Again",
      buttonTextColor: "#ffffff",
      buttonTextSize: "16",
      buttonTextWeight: "500",
      claimBestButtonText: "Claim Best Discount",
      claimBestButtonTextColor: "#ffffff",
      claimBestButtonTextSize: "16",
      claimBestButtonTextWeight: "500",
      claimBestButtonBgColor: "#000000",
      gameEndTabBgColor: "#ffffff",
      buttonBgColor: "#000000",
      // Email Modal Settings
      emailModalHeadingText: "Enter Your Email",
      emailModalHeadingColor: "#333333",
      emailModalHeadingSize: "20",
      emailModalHeadingWeight: "600",
      emailModalDescriptionText: "Please enter your email to claim your discount:",
      emailModalDescriptionColor: "#333333",
      emailModalDescriptionSize: "14",
      emailModalDescriptionWeight: "400",
      emailModalSubmitText: "Submit",
      emailModalSubmitColor: "#ffffff",
      emailModalSubmitSize: "16",
      emailModalSubmitWeight: "500",
      emailModalCancelText: "Cancel",
      emailModalCancelColor: "#333333",
      emailModalCancelSize: "16",
      emailModalCancelWeight: "500",
      emailModalBgColor: "#ffffff",
      emailModalSubmitBgColor: "#000000",
      emailModalCancelBgColor: "#cccccc",
      // Discount Code Modal Settings
      discountModalHeadingText: "Your Discount Code",
      discountModalHeadingColor: "#333333",
      discountModalHeadingSize: "20",
      discountModalHeadingWeight: "600",
      discountModalCloseText: "Close",
      discountModalCloseColor: "#ffffff",
      discountModalCloseSize: "16",
      discountModalCloseWeight: "500",
      discountModalBgColor: "#ffffff",
      discountModalCloseBgColor: "#000000",
      discountModalDescriptionText: "Copy your code and use it at checkout",
      discountModalDescriptionColor: "#333333",
      discountModalDescriptionSize: "14",
      discountModalDescriptionWeight: "400",
    };

  // Get or create game settings for this shop
  let settings = await prisma.gameSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.gameSettings.create({
      data: {
        shop,
        selectedGame: "bouncing-ball",
        enabled: true,
        emailRequired: true,
        bouncingBallSettings: defaultBouncingBall,
        horizontalLinesSettings: defaultHorizontalLines,
        reactionClickSettings: defaultReactionClick,
      },
    });
  }

  // Helper function to parse JSON settings with defaults
  const parseGameSettings = (jsonValue: any, defaults: any) => {
    if (!jsonValue) return defaults;
    try {
      const parsed = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue;
      return { ...defaults, ...parsed };
    } catch (e) {
      console.error('Error parsing game settings:', e);
      return defaults;
    }
  };

  // Get settings for the selected game
  const selectedGame = settings.selectedGame;
  let gameSettings;
  
  if (selectedGame === "bouncing-ball") {
    gameSettings = parseGameSettings(settings.bouncingBallSettings, defaultBouncingBall);
  } else if (selectedGame === "horizontal-lines") {
    gameSettings = parseGameSettings(settings.horizontalLinesSettings, defaultHorizontalLines);
  } else if (selectedGame === "reaction-click") {
    gameSettings = parseGameSettings(settings.reactionClickSettings, defaultReactionClick);
  } else {
    gameSettings = defaultBouncingBall; // Fallback
  }

  return Response.json(
    {
      selectedGame: settings.selectedGame,
      enabled: settings.enabled,
      emailRequired: settings.emailRequired,
      requireEmailToClaim: settings.emailRequired ?? false,
      requireName: settings.requireName ?? false,
      showStickyButton: settings.showStickyButton ?? false,
      stickyButtonText: settings.stickyButtonText ?? "Discount Game",
      stickyButtonColor: settings.stickyButtonColor ?? "#000000",
      stickyButtonDisplayPage: settings.stickyButtonDisplayPage ?? "any",
      stickyButtonShowOnDesktop: settings.stickyButtonShowOnDesktop ?? true,
      stickyButtonShowOnMobile: settings.stickyButtonShowOnMobile ?? true,
      logoUrl: settings.logoUrl ?? null,
      gameDifficulty: gameSettings.gameDifficulty ?? 50,
      popupText: gameSettings.popupText ?? "Discount Game",
      backgroundColor: gameSettings.backgroundColor ?? "#ffffff",
      ballColor: gameSettings.ballColor ?? "#000000",
      obstacleColor: gameSettings.obstacleColor ?? "#ff0000",
      borderRadius: gameSettings.borderRadius ?? 10,
      gameEndBorderRadius: gameSettings.gameEndBorderRadius ?? 10,
      emailModalBorderRadius: gameSettings.emailModalBorderRadius ?? 10,
      discountModalBorderRadius: gameSettings.discountModalBorderRadius ?? 10,
      maxDiscount: gameSettings.maxDiscount ?? "100",
      countdownTime: gameSettings.countdownTime ?? 10,
      mainText: gameSettings.mainText ?? "Discount Game",
      mainTextSize: gameSettings.mainTextSize ?? "24",
      mainTextColor: gameSettings.mainTextColor ?? "#000000",
      mainTextBgColor: gameSettings.mainTextBgColor ?? "#ffffff",
      mainTextWeight: gameSettings.mainTextWeight ?? "600",
      secondaryText: gameSettings.secondaryText ?? "Discount:",
      secondaryTextColor: gameSettings.secondaryTextColor ?? "#000000",
      secondaryTextSize: gameSettings.secondaryTextSize ?? "18",
      secondaryTextWeight: gameSettings.secondaryTextWeight ?? "400",
      rulesText: gameSettings.rulesText ?? "1 Score - 1% Discount",
      rulesTextColor: gameSettings.rulesTextColor ?? "#000000",
      rulesTextSize: gameSettings.rulesTextSize ?? "14",
      rulesTextWeight: gameSettings.rulesTextWeight ?? "400",
      instructionText: gameSettings.instructionText ?? "Click to Bounce",
      instructionTextColor: gameSettings.instructionTextColor ?? "#000000",
      instructionTextSize: gameSettings.instructionTextSize ?? "16",
      instructionTextWeight: gameSettings.instructionTextWeight ?? "400",
      gameEndText: gameSettings.gameEndText ?? "Your Discount",
      gameEndTextColor: gameSettings.gameEndTextColor ?? "#000000",
      gameEndTextSize: gameSettings.gameEndTextSize ?? "20",
      gameEndTextWeight: gameSettings.gameEndTextWeight ?? "400",
      buttonText: gameSettings.buttonText ?? "Play Again",
      buttonTextColor: gameSettings.buttonTextColor ?? "#ffffff",
      buttonTextSize: gameSettings.buttonTextSize ?? "16",
      buttonTextWeight: gameSettings.buttonTextWeight ?? "500",
      claimBestButtonText: gameSettings.claimBestButtonText ?? "Claim Best Discount",
      claimBestButtonTextColor: gameSettings.claimBestButtonTextColor ?? "#ffffff",
      claimBestButtonTextSize: gameSettings.claimBestButtonTextSize ?? "16",
      claimBestButtonTextWeight: gameSettings.claimBestButtonTextWeight ?? "500",
      gameEndTabBgColor: gameSettings.gameEndTabBgColor ?? "#ffffff",
      buttonBgColor: gameSettings.buttonBgColor ?? "#000000",
      claimBestButtonBgColor: gameSettings.claimBestButtonBgColor ?? "#000000",
      // Email Modal Settings
      emailModalHeadingText: gameSettings.emailModalHeadingText ?? "Enter Your Email",
      emailModalHeadingColor: gameSettings.emailModalHeadingColor ?? "#333333",
      emailModalHeadingSize: gameSettings.emailModalHeadingSize ?? "20",
      emailModalHeadingWeight: gameSettings.emailModalHeadingWeight ?? "600",
      emailModalDescriptionText: gameSettings.emailModalDescriptionText ?? "Please enter your email to claim your discount:",
      emailModalDescriptionColor: gameSettings.emailModalDescriptionColor ?? "#333333",
      emailModalDescriptionSize: gameSettings.emailModalDescriptionSize ?? "14",
      emailModalDescriptionWeight: gameSettings.emailModalDescriptionWeight ?? "400",
      emailModalSubmitText: gameSettings.emailModalSubmitText ?? "Submit",
      emailModalSubmitColor: gameSettings.emailModalSubmitColor ?? "#ffffff",
      emailModalSubmitSize: gameSettings.emailModalSubmitSize ?? "16",
      emailModalSubmitWeight: gameSettings.emailModalSubmitWeight ?? "500",
      emailModalCancelText: gameSettings.emailModalCancelText ?? "Cancel",
      emailModalCancelColor: gameSettings.emailModalCancelColor ?? "#333333",
      emailModalCancelSize: gameSettings.emailModalCancelSize ?? "16",
      emailModalCancelWeight: gameSettings.emailModalCancelWeight ?? "500",
      emailModalBgColor: gameSettings.emailModalBgColor ?? "#ffffff",
      emailModalSubmitBgColor: gameSettings.emailModalSubmitBgColor ?? "#000000",
      emailModalCancelBgColor: gameSettings.emailModalCancelBgColor ?? "#cccccc",
      // Discount Code Modal Settings
      discountModalHeadingText: gameSettings.discountModalHeadingText ?? "Your Discount Code",
      discountModalHeadingColor: gameSettings.discountModalHeadingColor ?? "#333333",
      discountModalHeadingSize: gameSettings.discountModalHeadingSize ?? "20",
      discountModalHeadingWeight: gameSettings.discountModalHeadingWeight ?? "600",
      discountModalCloseText: gameSettings.discountModalCloseText ?? "Close",
      discountModalCloseColor: gameSettings.discountModalCloseColor ?? "#ffffff",
      discountModalCloseSize: gameSettings.discountModalCloseSize ?? "16",
      discountModalCloseWeight: gameSettings.discountModalCloseWeight ?? "500",
      discountModalBgColor: gameSettings.discountModalBgColor ?? "#ffffff",
      discountModalCloseBgColor: gameSettings.discountModalCloseBgColor ?? "#000000",
      discountModalDescriptionText: gameSettings.discountModalDescriptionText ?? "Copy your code and use it at checkout",
      discountModalDescriptionColor: gameSettings.discountModalDescriptionColor ?? "#333333",
      discountModalDescriptionSize: gameSettings.discountModalDescriptionSize ?? "14",
      discountModalDescriptionWeight: gameSettings.discountModalDescriptionWeight ?? "400",
    },
    {
      headers: corsHeaders,
    }
  );
};

