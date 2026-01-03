import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  Page,
  Card,
  Form,
  FormLayout,
  TextField,
  RangeSlider,
  Checkbox,
  InlineGrid,
  Thumbnail,
  BlockStack,
  Text,
  Button,
  ButtonGroup,
  Banner,
  InlineStack,
  Box,
  RadioButton,
  Select,
} from "@shopify/polaris";
import { DesktopIcon, MobileIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const authResult = await authenticate.admin(request);
    
    if (!authResult || !authResult.session) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const { admin, session } = authResult;
    
    if (!session || !session.shop) {
      console.log('ERROR: No session or shop in authResult');
      throw new Response("Unauthorized - no session", { status: 401 });
    }

    const shop = session.shop;
    let settings = await prisma.gameSettings.findUnique({
    where: { shop },
  });

  // Default per-game settings
  const defaultSettings = {
    "bouncing-ball": {
      backgroundColor: "#ffffff",
      ballColor: "#000000",
      obstacleColor: "#ff0000",
      popupText: "Discount Game",
      borderRadius: 10,
      gameAreaBorderRadius: 10,
      gameEndBorderRadius: 10,
      emailModalBorderRadius: 10,
      discountModalBorderRadius: 10,
      gameDifficulty: 50,
      maxDiscount: "35",
    },
    "horizontal-lines": {
      backgroundColor: "#ffffff",
      ballColor: "#000000",
      obstacleColor: "#ff0000",
      popupText: "Discount Game",
      borderRadius: 10,
      gameAreaBorderRadius: 10,
      gameEndBorderRadius: 10,
      emailModalBorderRadius: 10,
      discountModalBorderRadius: 10,
      gameDifficulty: 50,
      maxDiscount: "35",
    },
    "reaction-click": {
      backgroundColor: "#021412",
      ballColor: "#00ce90",
      popupText: "Discount Game",
      borderRadius: 10,
      gameAreaBorderRadius: 10,
      gameEndBorderRadius: 10,
      emailModalBorderRadius: 10,
      discountModalBorderRadius: 10,
      gameDifficulty: 50,
      maxDiscount: "35",
      countdownTime: 10,
    },
  };

  if (!settings) {
    settings = await prisma.gameSettings.create({
      data: {
        shop,
        selectedGame: "bouncing-ball",
        enabled: true,
        emailRequired: true,
        bouncingBallSettings: defaultSettings["bouncing-ball"],
        horizontalLinesSettings: defaultSettings["horizontal-lines"],
        reactionClickSettings: defaultSettings["reaction-click"],
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

  // Parse each game's settings
  const bouncingBallSettings = parseGameSettings(settings.bouncingBallSettings, defaultSettings["bouncing-ball"]);
  const horizontalLinesSettings = parseGameSettings(settings.horizontalLinesSettings, defaultSettings["horizontal-lines"]);
  const reactionClickSettings = parseGameSettings(settings.reactionClickSettings, defaultSettings["reaction-click"]);

  // Get settings for the currently selected game
  const gameSettingsMap: Record<string, any> = {
    "bouncing-ball": bouncingBallSettings,
    "horizontal-lines": horizontalLinesSettings,
    "reaction-click": reactionClickSettings,
  };

  const currentGameSettings = gameSettingsMap[settings.selectedGame as keyof typeof gameSettingsMap] || defaultSettings[settings.selectedGame as keyof typeof defaultSettings];

  return { 
    settings: {
      ...settings,
      discountCodePrefix: settings.discountCodePrefix ?? "wincode",
      showStickyButton: (settings as any).showStickyButton ?? false,
      stickyButtonText: (settings as any).stickyButtonText ?? "Discount Game",
      stickyButtonColor: (settings as any).stickyButtonColor ?? "#000000",
      stickyButtonDisplayPage: (settings as any).stickyButtonDisplayPage ?? "any",
      stickyButtonShowOnDesktop: (settings as any).stickyButtonShowOnDesktop ?? true,
      stickyButtonShowOnMobile: (settings as any).stickyButtonShowOnMobile ?? true,
      logoUrl: (settings as any).logoUrl ?? null,
      bouncingBallSettings,
      horizontalLinesSettings,
      reactionClickSettings,
      // Current game settings for easy access
      ...currentGameSettings,
    }
  };
  } catch (error) {
    console.error('=== LOADER ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error:', error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response(`Error: ${error}`, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const authResult = await authenticate.admin(request);
    
    if (!authResult || !authResult.session) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const { admin, session } = authResult;
    
    if (!session || !session.shop) {
      throw new Response("Unauthorized", { status: 401 });
    }
    
    const shop = session.shop;
    const formData = await request.formData();
    
    const selectedGame = formData.get("selectedGame") as string;
    const enabled = formData.get("enabled") === "true";
    const emailRequired = formData.get("emailRequired") === "true";
    const requireEmailToClaim = formData.get("requireEmailToClaim") === "true";
    const requireName = formData.get("requireName") === "true";
    const discountCodePrefix = (formData.get("discountCodePrefix") as string) || "wincode";
    const logoUrl = (formData.get("logoUrl") as string) || null;
    
    // Handle numeric values that can be 0 - use isNaN check instead of || operator
    const gameDifficultyValue = parseInt(formData.get("gameDifficulty") as string);
    const gameDifficulty = isNaN(gameDifficultyValue) ? 50 : gameDifficultyValue;
    
    const popupText = (formData.get("popupText") as string) || "Discount Game";
    const backgroundColor = (formData.get("backgroundColor") as string) || "#ffffff";
    const ballColor = (formData.get("ballColor") as string) || "#000000";
    const obstacleColor = (formData.get("obstacleColor") as string) || "#ff0000";
    
    const borderRadiusValue = parseInt(formData.get("borderRadius") as string);
    const borderRadius = isNaN(borderRadiusValue) ? 10 : borderRadiusValue;
    const gameAreaBorderRadiusValue = parseInt(formData.get("gameAreaBorderRadius") as string);
    const gameAreaBorderRadius = isNaN(gameAreaBorderRadiusValue) ? 10 : gameAreaBorderRadiusValue;
    const gameEndBorderRadiusValue = parseInt(formData.get("gameEndBorderRadius") as string);
    const gameEndBorderRadius = isNaN(gameEndBorderRadiusValue) ? 10 : gameEndBorderRadiusValue;
    const emailModalBorderRadiusValue = parseInt(formData.get("emailModalBorderRadius") as string);
    const emailModalBorderRadius = isNaN(emailModalBorderRadiusValue) ? 10 : emailModalBorderRadiusValue;
    const discountModalBorderRadiusValue = parseInt(formData.get("discountModalBorderRadius") as string);
    const discountModalBorderRadius = isNaN(discountModalBorderRadiusValue) ? 10 : discountModalBorderRadiusValue;
    
    const maxDiscount = (formData.get("maxDiscount") as string) || "35";
    
    const countdownTimeValue = parseInt(formData.get("countdownTime") as string);
    const countdownTime = isNaN(countdownTimeValue) ? 10 : countdownTimeValue;

    // Text settings
    const mainText = (formData.get("mainText") as string) || "Discount Game";
    const mainTextSize = (formData.get("mainTextSize") as string) || "24";
    const mainTextColor = (formData.get("mainTextColor") as string) || "#000000";
    const mainTextBgColor = (formData.get("mainTextBgColor") as string) || "#ffffff";
    const mainTextWeight = (formData.get("mainTextWeight") as string) || "600";
    const secondaryText = (formData.get("secondaryText") as string) || "Discount:";
    const secondaryTextColor = (formData.get("secondaryTextColor") as string) || "#000000";
    const secondaryTextSize = (formData.get("secondaryTextSize") as string) || "18";
    const secondaryTextWeight = (formData.get("secondaryTextWeight") as string) || "400";
    const rulesText = (formData.get("rulesText") as string) || "1 Score - 1% Discount";
    const rulesTextColor = (formData.get("rulesTextColor") as string) || "#000000";
    const rulesTextSize = (formData.get("rulesTextSize") as string) || "14";
    const rulesTextWeight = (formData.get("rulesTextWeight") as string) || "400";
    const instructionText = (formData.get("instructionText") as string) || "Click to Bounce";
    const instructionTextColor = (formData.get("instructionTextColor") as string) || "#000000";
    const instructionTextSize = (formData.get("instructionTextSize") as string) || "16";
    const instructionTextWeight = (formData.get("instructionTextWeight") as string) || "400";
    const gameEndText = (formData.get("gameEndText") as string) || "Your Discount";
    const gameEndTextColor = (formData.get("gameEndTextColor") as string) || "#000000";
    const gameEndTextSize = (formData.get("gameEndTextSize") as string) || "20";
    const gameEndTextWeight = (formData.get("gameEndTextWeight") as string) || "400";
    const buttonText = (formData.get("buttonText") as string) || "Play Again";
    const buttonTextColor = (formData.get("buttonTextColor") as string) || "#ffffff";
    const buttonTextSize = (formData.get("buttonTextSize") as string) || "16";
    const buttonTextWeight = (formData.get("buttonTextWeight") as string) || "500";
    const claimBestButtonText = (formData.get("claimBestButtonText") as string) || "Claim Best Discount";
    const claimBestButtonTextColor = (formData.get("claimBestButtonTextColor") as string) || "#ffffff";
    const claimBestButtonTextSize = (formData.get("claimBestButtonTextSize") as string) || "16";
    const claimBestButtonTextWeight = (formData.get("claimBestButtonTextWeight") as string) || "500";
    const gameEndTabBgColor = (formData.get("gameEndTabBgColor") as string) || "#ffffff";
    const buttonBgColor = (formData.get("buttonBgColor") as string) || "#000000";
    const claimBestButtonBgColor = (formData.get("claimBestButtonBgColor") as string) || "#000000";

    // Email Modal Settings
    const emailModalHeadingText = (formData.get("emailModalHeadingText") as string) || "Enter Your Email";
    const emailModalHeadingColor = (formData.get("emailModalHeadingColor") as string) || "#333333";
    const emailModalHeadingSize = (formData.get("emailModalHeadingSize") as string) || "20";
    const emailModalHeadingWeight = (formData.get("emailModalHeadingWeight") as string) || "600";
    const emailModalDescriptionText = (formData.get("emailModalDescriptionText") as string) || "Please enter your email to claim your discount:";
    const emailModalDescriptionColor = (formData.get("emailModalDescriptionColor") as string) || "#333333";
    const emailModalDescriptionSize = (formData.get("emailModalDescriptionSize") as string) || "14";
    const emailModalDescriptionWeight = (formData.get("emailModalDescriptionWeight") as string) || "400";
    const emailModalSubmitText = (formData.get("emailModalSubmitText") as string) || "Submit";
    const emailModalSubmitColor = (formData.get("emailModalSubmitColor") as string) || "#ffffff";
    const emailModalSubmitSize = (formData.get("emailModalSubmitSize") as string) || "16";
    const emailModalSubmitWeight = (formData.get("emailModalSubmitWeight") as string) || "500";
    const emailModalCancelText = (formData.get("emailModalCancelText") as string) || "Cancel";
    const emailModalCancelColor = (formData.get("emailModalCancelColor") as string) || "#333333";
    const emailModalCancelSize = (formData.get("emailModalCancelSize") as string) || "16";
    const emailModalCancelWeight = (formData.get("emailModalCancelWeight") as string) || "500";
    const emailModalBgColor = (formData.get("emailModalBgColor") as string) || "#ffffff";
    const emailModalSubmitBgColor = (formData.get("emailModalSubmitBgColor") as string) || "#000000";
    const emailModalCancelBgColor = (formData.get("emailModalCancelBgColor") as string) || "#cccccc";

    // Discount Code Modal Settings
    const discountModalHeadingText = (formData.get("discountModalHeadingText") as string) || "Your Discount Code";
    const discountModalHeadingColor = (formData.get("discountModalHeadingColor") as string) || "#333333";
    const discountModalHeadingSize = (formData.get("discountModalHeadingSize") as string) || "20";
    const discountModalHeadingWeight = (formData.get("discountModalHeadingWeight") as string) || "600";
    const discountModalCloseText = (formData.get("discountModalCloseText") as string) || "Close";
    const discountModalCloseColor = (formData.get("discountModalCloseColor") as string) || "#ffffff";
    const discountModalCloseSize = (formData.get("discountModalCloseSize") as string) || "16";
    const discountModalCloseWeight = (formData.get("discountModalCloseWeight") as string) || "500";
    const discountModalBgColor = (formData.get("discountModalBgColor") as string) || "#ffffff";
    const discountModalCloseBgColor = (formData.get("discountModalCloseBgColor") as string) || "#000000";
    const discountModalDescriptionText = (formData.get("discountModalDescriptionText") as string) || "Copy your code and use it at checkout";
    const discountModalDescriptionColor = (formData.get("discountModalDescriptionColor") as string) || "#333333";
    const discountModalDescriptionSize = (formData.get("discountModalDescriptionSize") as string) || "14";
    const discountModalDescriptionWeight = (formData.get("discountModalDescriptionWeight") as string) || "400";

    // Sticky Button Settings
    const showStickyButton = formData.get("showStickyButton") === "true";
    const stickyButtonText = (formData.get("stickyButtonText") as string) || "Discount Game";
    const stickyButtonColor = (formData.get("stickyButtonColor") as string) || "#000000";
    const stickyButtonDisplayPage = (formData.get("stickyButtonDisplayPage") as string) || "any";
    const stickyButtonShowOnDesktop = formData.get("stickyButtonShowOnDesktop") === "true";
    const stickyButtonShowOnMobile = formData.get("stickyButtonShowOnMobile") === "true";

    const validGames = ["bouncing-ball", "reaction-click", "horizontal-lines"];
    if (!validGames.includes(selectedGame)) {
      throw new Response("Invalid game selection", { status: 400 });
    }

    // Get existing settings to preserve other games' settings
    const existingSettings = await prisma.gameSettings.findUnique({
      where: { shop },
    });

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

    // Default settings for each game
    const defaultBouncingBall = {
      backgroundColor: "#ffffff",
      ballColor: "#000000",
      obstacleColor: "#ff0000",
      popupText: "Discount Game",
      borderRadius: 10,
      gameAreaBorderRadius: 10,
      gameEndBorderRadius: 10,
      emailModalBorderRadius: 10,
      discountModalBorderRadius: 10,
      gameDifficulty: 50,
      maxDiscount: "35",
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
      gameAreaBorderRadius: 10,
      gameEndBorderRadius: 10,
      emailModalBorderRadius: 10,
      discountModalBorderRadius: 10,
      gameDifficulty: 50,
      maxDiscount: "35",
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
      gameAreaBorderRadius: 10,
      gameEndBorderRadius: 10,
      emailModalBorderRadius: 10,
      discountModalBorderRadius: 10,
      gameDifficulty: 50,
      maxDiscount: "35",
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

    // Get existing settings for each game (preserve other games' settings)
    const bouncingBallSettings = parseGameSettings(
      existingSettings?.bouncingBallSettings,
      defaultBouncingBall
    );
    const horizontalLinesSettings = parseGameSettings(
      existingSettings?.horizontalLinesSettings,
      defaultHorizontalLines
    );
    const reactionClickSettings = parseGameSettings(
      existingSettings?.reactionClickSettings,
      defaultReactionClick
    );

    // Update settings for the selected game
    const updatedSettings = {
      backgroundColor,
      ballColor,
      ...(selectedGame !== "reaction-click" && { obstacleColor }),
      popupText,
      borderRadius,
      gameDifficulty,
      maxDiscount,
      ...(selectedGame === "reaction-click" && { countdownTime }),
      mainText,
      mainTextSize,
      mainTextColor,
      mainTextBgColor,
      mainTextWeight,
      secondaryText,
      secondaryTextColor,
      secondaryTextSize,
      secondaryTextWeight,
      rulesText,
      rulesTextColor,
      rulesTextSize,
      rulesTextWeight,
      instructionText,
      instructionTextColor,
      instructionTextSize,
      instructionTextWeight,
      gameEndText,
      gameEndTextColor,
      gameEndTextSize,
      gameEndTextWeight,
      buttonText,
      buttonTextColor,
      buttonTextSize,
      buttonTextWeight,
      claimBestButtonText,
      claimBestButtonTextColor,
      claimBestButtonTextSize,
      claimBestButtonTextWeight,
      gameEndTabBgColor,
      buttonBgColor,
      claimBestButtonBgColor,
      gameAreaBorderRadius,
      gameEndBorderRadius,
      emailModalBorderRadius,
      discountModalBorderRadius,
      // Email Modal Settings
      emailModalHeadingText,
      emailModalHeadingColor,
      emailModalHeadingSize,
      emailModalHeadingWeight,
      emailModalDescriptionText,
      emailModalDescriptionColor,
      emailModalDescriptionSize,
      emailModalDescriptionWeight,
      emailModalSubmitText,
      emailModalSubmitColor,
      emailModalSubmitSize,
      emailModalSubmitWeight,
      emailModalCancelText,
      emailModalCancelColor,
      emailModalCancelSize,
      emailModalCancelWeight,
      emailModalBgColor,
      emailModalSubmitBgColor,
      emailModalCancelBgColor,
      // Discount Code Modal Settings
      discountModalHeadingText,
      discountModalHeadingColor,
      discountModalHeadingSize,
      discountModalHeadingWeight,
      discountModalCloseText,
      discountModalCloseColor,
      discountModalCloseSize,
      discountModalCloseWeight,
      discountModalBgColor,
      discountModalCloseBgColor,
      discountModalDescriptionText,
      discountModalDescriptionColor,
      discountModalDescriptionSize,
      discountModalDescriptionWeight,
    };

    // Get existing settings to preserve other game settings
    const existingGameSettings = await prisma.gameSettings.findUnique({
      where: { shop },
    });

    // Prepare update object with all game settings
    const updateData: any = {
      selectedGame,
      enabled,
      emailRequired: requireEmailToClaim, // Use requireEmailToClaim for email requirement
      requireName,
      discountCodePrefix,
      logoUrl: logoUrl || null,
      showStickyButton,
      stickyButtonText,
      stickyButtonColor,
      stickyButtonDisplayPage,
      stickyButtonShowOnDesktop,
      stickyButtonShowOnMobile,
    };

    // Update only the selected game's settings
    if (selectedGame === "bouncing-ball") {
      updateData.bouncingBallSettings = updatedSettings;
      updateData.horizontalLinesSettings = horizontalLinesSettings;
      updateData.reactionClickSettings = reactionClickSettings;
    } else if (selectedGame === "horizontal-lines") {
      updateData.bouncingBallSettings = bouncingBallSettings;
      updateData.horizontalLinesSettings = updatedSettings;
      updateData.reactionClickSettings = reactionClickSettings;
    } else if (selectedGame === "reaction-click") {
      updateData.bouncingBallSettings = bouncingBallSettings;
      updateData.horizontalLinesSettings = horizontalLinesSettings;
      updateData.reactionClickSettings = updatedSettings;
    }

    const settings = await prisma.gameSettings.upsert({
      where: { shop },
      update: updateData,
      create: {
        shop,
        selectedGame,
        enabled,
        emailRequired: requireEmailToClaim, // Use requireEmailToClaim for email requirement
        requireName,
        discountCodePrefix,
        logoUrl: (logoUrl || null) as any,
        showStickyButton: showStickyButton as any,
        stickyButtonText: stickyButtonText as any,
        stickyButtonColor: stickyButtonColor as any,
        stickyButtonDisplayPage: stickyButtonDisplayPage as any,
        stickyButtonShowOnDesktop: stickyButtonShowOnDesktop as any,
        stickyButtonShowOnMobile: stickyButtonShowOnMobile as any,
        bouncingBallSettings: selectedGame === "bouncing-ball" ? updatedSettings : defaultBouncingBall,
        horizontalLinesSettings: selectedGame === "horizontal-lines" ? updatedSettings : defaultHorizontalLines,
        reactionClickSettings: selectedGame === "reaction-click" ? updatedSettings : defaultReactionClick,
      },
    });

    return { success: true, settings };
  } catch (error) {
    console.error('=== ACTION ERROR ===');
    console.error('Error:', error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response(`Error: ${error}`, { status: 500 });
  }
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  
  // Safety check for settings
  if (!settings) {
    return <Page title="Game Popup Settings">Loading...</Page>;
  }
  
  const [selectedGame, setSelectedGame] = useState(settings.selectedGame || "bouncing-ball");
  const [emailRequired, setEmailRequired] = useState(settings.emailRequired ?? true);
  const [showAutoPopUp, setShowAutoPopUp] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(settings.showStickyButton ?? false);
  const [popupDelay, setPopupDelay] = useState('0'); // Default to 'immediately'
  const [popupDisplayPage, setPopupDisplayPage] = useState('any'); // Default to 'any'
  const [showOnDesktop, setShowOnDesktop] = useState(true);
  const [showOnMobile, setShowOnMobile] = useState(true);
  const [customUrls, setCustomUrls] = useState<string[]>(['']); // Start with one empty TextField
  const [stickyButtonText, setStickyButtonText] = useState(settings.stickyButtonText ?? 'Discount Game');
  const [stickyButtonColor, setStickyButtonColor] = useState(settings.stickyButtonColor ?? '#000000');
  const [stickyButtonDisplayPage, setStickyButtonDisplayPage] = useState(settings.stickyButtonDisplayPage ?? 'any');
  const [stickyButtonShowOnDesktop, setStickyButtonShowOnDesktop] = useState(settings.stickyButtonShowOnDesktop ?? true);
  const [stickyButtonShowOnMobile, setStickyButtonShowOnMobile] = useState(settings.stickyButtonShowOnMobile ?? true);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? '');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const handleAddCustomUrl = () => {
    setCustomUrls([...customUrls, '']); // Add a new empty TextField
  };

  const handleUpdateCustomUrl = (index: number, value: string) => {
    const updated = [...customUrls];
    updated[index] = value;
    setCustomUrls(updated);
  };

  const handleRemoveCustomUrl = (index: number) => {
    setCustomUrls(customUrls.filter((_, i) => i !== index));
  };

  // Get current game settings from separate fields
  const getCurrentGameSettings = (game: string) => {
    // Helper to parse JSON settings
    const parseSettings = (jsonValue: any) => {
      if (!jsonValue) return {};
      if (typeof jsonValue === 'string') {
        try {
          return JSON.parse(jsonValue);
        } catch (e) {
          return {};
        }
      }
      return jsonValue;
    };
    
    const gameSettingsMap: Record<string, any> = {
      "bouncing-ball": parseSettings(settings.bouncingBallSettings),
      "horizontal-lines": parseSettings(settings.horizontalLinesSettings),
      "reaction-click": parseSettings(settings.reactionClickSettings),
    };
    
    const gameSettings = gameSettingsMap[game] || {};
    
    // Default values per game
    const defaults = {
      "bouncing-ball": {
        backgroundColor: "#ffffff",
        ballColor: "#000000",
        obstacleColor: "#ff0000",
        popupText: "Discount Game",
        borderRadius: 10,
        gameDifficulty: 50,
        maxDiscount: "35",
        mainText: "Discount Game",
        mainTextSize: "24",
        mainTextColor: "#000000",
        mainTextBgColor: "#ffffff",
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
      gameEndTabBgColor: "#ffffff",
      buttonBgColor: "#000000",
    },
      "horizontal-lines": {
        backgroundColor: "#ffffff",
        ballColor: "#000000",
        obstacleColor: "#ff0000",
        popupText: "Discount Game",
        borderRadius: 10,
        gameDifficulty: 50,
        maxDiscount: "35",
        mainText: "Discount Game",
        mainTextSize: "24",
        mainTextColor: "#000000",
        mainTextBgColor: "#ffffff",
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
      gameEndTabBgColor: "#ffffff",
      buttonBgColor: "#000000",
      claimBestButtonBgColor: "#000000",
    },
    "reaction-click": {
        backgroundColor: "#021412",
        ballColor: "#00ce90",
        popupText: "Discount Game",
        borderRadius: 10,
        gameDifficulty: 50,
        maxDiscount: "35",
        countdownTime: 10,
        mainText: "Discount Game",
        mainTextSize: "24",
        mainTextColor: "#000000",
        mainTextBgColor: "#ffffff",
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
      gameEndTabBgColor: "#ffffff",
      buttonBgColor: "#000000",
      claimBestButtonBgColor: "#000000",
    },
    };
    
    return { ...defaults[game as keyof typeof defaults], ...gameSettings };
  };
  
  // State for current game settings
  // Helper function to map difficulty value (0-100) to slider position
  const getDifficultySliderPosition = (value: number, game: string) => {
    if (game === "horizontal-lines") {
      // 5 levels: 0-20, 21-40, 41-60, 61-80, 81-100
      if (value <= 20) return 0;
      if (value <= 40) return 1;
      if (value <= 60) return 2;
      if (value <= 80) return 3;
      return 4;
    } else {
      // Bouncing ball: 4 levels: 0-25, 26-50, 51-75, 76-100
      if (value <= 25) return 0;
      if (value <= 50) return 1;
      if (value <= 75) return 2;
      return 3;
    }
  };

  // Helper function to map slider position to difficulty value (0-100)
  const getDifficultyFromSlider = (position: number, game: string) => {
    if (game === "horizontal-lines") {
      // Midpoints: 10, 30, 50, 70, 90
      const difficultyValues = [10, 30, 50, 70, 90];
      return difficultyValues[position] || 50;
    } else {
      // Bouncing ball: Midpoints: 12, 37, 62, 87
      const difficultyValues = [12, 37, 62, 87];
      return difficultyValues[position] || 37;
    }
  };

  // Get difficulty labels based on game
  const getDifficultyLabels = (game: string) => {
    if (game === "horizontal-lines") {
      return ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    } else {
      return ['Easy', 'Medium', 'Hard', 'Very Hard'];
    }
  };

  const [gameDifficulty, setGameDifficulty] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameDifficulty ?? 50;
  });

  // Slider position state (0-3 for bouncing-ball, 0-4 for horizontal-lines)
  const [difficultySlider, setDifficultySlider] = useState(() => {
    return getDifficultySliderPosition(gameDifficulty, selectedGame);
  });
  const [popupText, setPopupText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.popupText ?? "Discount Game";
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.backgroundColor ?? "#ffffff";
  });
  const [ballColor, setBallColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.ballColor ?? "#000000";
  });
  const [obstacleColor, setObstacleColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.obstacleColor ?? "#ff0000";
  });
  const [borderRadius, setBorderRadius] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.borderRadius ?? 10;
  });
  const [gameAreaBorderRadius, setGameAreaBorderRadius] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameAreaBorderRadius ?? 10;
  });
  const [gameEndBorderRadius, setGameEndBorderRadius] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameEndBorderRadius ?? 10;
  });
  const [emailModalBorderRadius, setEmailModalBorderRadius] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalBorderRadius ?? 10;
  });
  const [discountModalBorderRadius, setDiscountModalBorderRadius] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalBorderRadius ?? 10;
  });
  const [maxDiscount, setMaxDiscount] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    const validValues = ['15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75'];
    const currentValue = current.maxDiscount ?? "35";
    // If the current value is not in the valid list, default to "35"
    return validValues.includes(currentValue) ? currentValue : "35";
  });

  const [countdownTime, setCountdownTime] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.countdownTime ?? 10;
  });

  // New state variables for email requirement and discount code
  const [requireEmailToClaim, setRequireEmailToClaim] = useState(settings.emailRequired ?? false);
  const [requireName, setRequireName] = useState(settings.requireName ?? false);
  const [discountCode, setDiscountCode] = useState(settings.discountCodePrefix ?? "wincode");

  // Text Settings state variables
  const [mainText, setMainText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.mainText ?? "Discount Game";
  });
  const [mainTextSize, setMainTextSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.mainTextSize ?? "24";
  });
  const [mainTextColor, setMainTextColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.mainTextColor ?? "#000000";
  });
  const [mainTextBgColor, setMainTextBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.mainTextBgColor ?? "#ffffff";
  });
  const [mainTextWeight, setMainTextWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.mainTextWeight ?? "600";
  });

  const [secondaryText, setSecondaryText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.secondaryText ?? "Discount:";
  });
  const [secondaryTextColor, setSecondaryTextColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.secondaryTextColor ?? "#000000";
  });
  const [secondaryTextSize, setSecondaryTextSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.secondaryTextSize ?? "18";
  });
  const [secondaryTextWeight, setSecondaryTextWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.secondaryTextWeight ?? "400";
  });

  const [rulesText, setRulesText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.rulesText ?? "1 Score - 1% Discount";
  });
  const [rulesTextColor, setRulesTextColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.rulesTextColor ?? "#000000";
  });
  const [rulesTextSize, setRulesTextSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.rulesTextSize ?? "14";
  });
  const [rulesTextWeight, setRulesTextWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.rulesTextWeight ?? "400";
  });

  const [instructionText, setInstructionText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.instructionText ?? "Click to Bounce";
  });
  const [instructionTextColor, setInstructionTextColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.instructionTextColor ?? "#000000";
  });
  const [instructionTextSize, setInstructionTextSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.instructionTextSize ?? "16";
  });
  const [instructionTextWeight, setInstructionTextWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.instructionTextWeight ?? "400";
  });

  const [gameEndText, setGameEndText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameEndText ?? "Your Discount";
  });
  const [gameEndTextColor, setGameEndTextColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameEndTextColor ?? "#000000";
  });
  const [gameEndTextSize, setGameEndTextSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameEndTextSize ?? "20";
  });
  const [gameEndTextWeight, setGameEndTextWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameEndTextWeight ?? "400";
  });

  const [buttonText, setButtonText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.buttonText ?? "Play Again";
  });
  const [buttonTextColor, setButtonTextColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.buttonTextColor ?? "#ffffff";
  });
  const [buttonTextSize, setButtonTextSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.buttonTextSize ?? "16";
  });
  const [buttonTextWeight, setButtonTextWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.buttonTextWeight ?? "500";
  });
  const [claimBestButtonText, setClaimBestButtonText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.claimBestButtonText ?? "Claim Best Discount";
  });
  const [claimBestButtonTextColor, setClaimBestButtonTextColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.claimBestButtonTextColor ?? "#ffffff";
  });
  const [claimBestButtonTextSize, setClaimBestButtonTextSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.claimBestButtonTextSize ?? "16";
  });
  const [claimBestButtonTextWeight, setClaimBestButtonTextWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.claimBestButtonTextWeight ?? "500";
  });
  const [gameEndTabBgColor, setGameEndTabBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.gameEndTabBgColor ?? "#ffffff";
  });
  const [buttonBgColor, setButtonBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.buttonBgColor ?? "#000000";
  });
  const [claimBestButtonBgColor, setClaimBestButtonBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.claimBestButtonBgColor ?? "#000000";
  });

  // Email Modal Settings
  const [emailModalHeadingText, setEmailModalHeadingText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalHeadingText ?? "Enter Your Email";
  });
  const [emailModalHeadingColor, setEmailModalHeadingColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalHeadingColor ?? "#333333";
  });
  const [emailModalHeadingSize, setEmailModalHeadingSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalHeadingSize ?? "20";
  });
  const [emailModalHeadingWeight, setEmailModalHeadingWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalHeadingWeight ?? "600";
  });
  const [emailModalDescriptionText, setEmailModalDescriptionText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalDescriptionText ?? "Please enter your email to claim your discount:";
  });
  const [emailModalDescriptionColor, setEmailModalDescriptionColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalDescriptionColor ?? "#333333";
  });
  const [emailModalDescriptionSize, setEmailModalDescriptionSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalDescriptionSize ?? "14";
  });
  const [emailModalDescriptionWeight, setEmailModalDescriptionWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalDescriptionWeight ?? "400";
  });
  const [emailModalSubmitText, setEmailModalSubmitText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalSubmitText ?? "Submit";
  });
  const [emailModalSubmitColor, setEmailModalSubmitColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalSubmitColor ?? "#ffffff";
  });
  const [emailModalSubmitSize, setEmailModalSubmitSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalSubmitSize ?? "16";
  });
  const [emailModalSubmitWeight, setEmailModalSubmitWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalSubmitWeight ?? "500";
  });
  const [emailModalCancelText, setEmailModalCancelText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalCancelText ?? "Cancel";
  });
  const [emailModalCancelColor, setEmailModalCancelColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalCancelColor ?? "#333333";
  });
  const [emailModalCancelSize, setEmailModalCancelSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalCancelSize ?? "16";
  });
  const [emailModalCancelWeight, setEmailModalCancelWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalCancelWeight ?? "500";
  });
  const [emailModalBgColor, setEmailModalBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalBgColor ?? "#ffffff";
  });
  const [emailModalSubmitBgColor, setEmailModalSubmitBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalSubmitBgColor ?? "#000000";
  });
  const [emailModalCancelBgColor, setEmailModalCancelBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.emailModalCancelBgColor ?? "#cccccc";
  });

  // Discount Code Modal Settings
  const [discountModalHeadingText, setDiscountModalHeadingText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalHeadingText ?? "Your Discount Code";
  });
  const [discountModalHeadingColor, setDiscountModalHeadingColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalHeadingColor ?? "#333333";
  });
  const [discountModalHeadingSize, setDiscountModalHeadingSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalHeadingSize ?? "20";
  });
  const [discountModalHeadingWeight, setDiscountModalHeadingWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalHeadingWeight ?? "600";
  });
  const [discountModalCloseText, setDiscountModalCloseText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalCloseText ?? "Close";
  });
  const [discountModalCloseColor, setDiscountModalCloseColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalCloseColor ?? "#ffffff";
  });
  const [discountModalCloseSize, setDiscountModalCloseSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalCloseSize ?? "16";
  });
  const [discountModalCloseWeight, setDiscountModalCloseWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalCloseWeight ?? "500";
  });
  const [discountModalBgColor, setDiscountModalBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalBgColor ?? "#ffffff";
  });
  const [discountModalCloseBgColor, setDiscountModalCloseBgColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalCloseBgColor ?? "#000000";
  });

  // Discount Code Description Settings
  const [discountModalDescriptionText, setDiscountModalDescriptionText] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalDescriptionText ?? "Copy your code and use it at checkout";
  });
  const [discountModalDescriptionColor, setDiscountModalDescriptionColor] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalDescriptionColor ?? "#333333";
  });
  const [discountModalDescriptionSize, setDiscountModalDescriptionSize] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalDescriptionSize ?? "14";
  });
  const [discountModalDescriptionWeight, setDiscountModalDescriptionWeight] = useState(() => {
    const current = getCurrentGameSettings(selectedGame);
    return current.discountModalDescriptionWeight ?? "400";
  });

  // Preview game URL state
  const [previewGameUrl, setPreviewGameUrl] = useState("");
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Helper function to build game URL from current settings
  const buildGameUrl = () => {
    if (!selectedGame) return "";
    
    const baseUrl = window.location.origin;
    const gamePath = `/games/${selectedGame}/index.html`;
    
    const params = new URLSearchParams();
    params.append('bg', backgroundColor);
    params.append('ball', ballColor);
    if (hasObstacles) {
      params.append('obstacle', obstacleColor);
    }
    params.append('difficulty', gameDifficulty.toString());
    params.append('maxDiscount', maxDiscount);
    params.append('mainText', mainText);
    params.append('mainTextSize', mainTextSize);
    params.append('mainTextColor', mainTextColor);
    params.append('mainTextBgColor', mainTextBgColor);
    params.append('mainTextWeight', mainTextWeight);
    params.append('secondaryText', secondaryText);
    params.append('secondaryTextColor', secondaryTextColor);
    params.append('secondaryTextSize', secondaryTextSize);
    params.append('secondaryTextWeight', secondaryTextWeight);
    params.append('rulesText', rulesText);
    params.append('rulesTextColor', rulesTextColor);
    params.append('rulesTextSize', rulesTextSize);
    params.append('rulesTextWeight', rulesTextWeight);
    params.append('instructionText', instructionText);
    params.append('instructionTextColor', instructionTextColor);
    params.append('instructionTextSize', instructionTextSize);
    params.append('instructionTextWeight', instructionTextWeight);
    params.append('gameEndText', gameEndText);
    params.append('gameEndTextColor', gameEndTextColor);
    params.append('gameEndTextSize', gameEndTextSize);
    params.append('gameEndTextWeight', gameEndTextWeight);
    params.append('buttonText', buttonText);
    params.append('buttonTextColor', buttonTextColor);
    params.append('buttonTextSize', buttonTextSize);
    params.append('buttonTextWeight', buttonTextWeight);
    params.append('claimBestButtonText', claimBestButtonText);
    params.append('claimBestButtonTextColor', claimBestButtonTextColor);
    params.append('claimBestButtonTextSize', claimBestButtonTextSize);
    params.append('claimBestButtonTextWeight', claimBestButtonTextWeight);
    params.append('gameEndTabBgColor', gameEndTabBgColor);
    params.append('buttonBgColor', buttonBgColor);
    params.append('claimBestButtonBgColor', claimBestButtonBgColor);
    params.append('borderRadius', borderRadius.toString());
    params.append('gameEndBorderRadius', gameEndBorderRadius.toString());
    params.append('emailModalBorderRadius', emailModalBorderRadius.toString());
    params.append('discountModalBorderRadius', discountModalBorderRadius.toString());
    
    // Add shop and requireEmailToClaim parameters
    params.append('shop', settings.shop || '');
    params.append('requireEmailToClaim', requireEmailToClaim.toString());
    params.append('requireName', requireName.toString());
    
    if (selectedGame === 'reaction-click') {
      params.append('countdownTime', countdownTime.toString());
    }
    
    return `${baseUrl}${gamePath}?${params.toString()}`;
  };

  // Update preview URL when settings change
  useEffect(() => {
    const url = buildGameUrl();
    setPreviewGameUrl(url);
  }, [
    selectedGame,
    backgroundColor,
    ballColor,
    obstacleColor,
    gameDifficulty,
    maxDiscount,
    countdownTime,
    mainText,
    mainTextSize,
    mainTextColor,
    mainTextBgColor,
    mainTextWeight,
    borderRadius,
    secondaryText,
    secondaryTextColor,
    secondaryTextSize,
    secondaryTextWeight,
    rulesText,
    rulesTextColor,
    rulesTextSize,
    rulesTextWeight,
    instructionText,
    instructionTextColor,
    instructionTextSize,
    instructionTextWeight,
    gameEndText,
    gameEndTextColor,
    gameEndTextSize,
    gameEndTextWeight,
    buttonText,
    buttonTextColor,
    buttonTextSize,
    buttonTextWeight,
    claimBestButtonText,
    claimBestButtonTextColor,
    claimBestButtonTextSize,
    claimBestButtonTextWeight,
    gameEndTabBgColor,
    buttonBgColor,
    claimBestButtonBgColor,
    gameEndBorderRadius,
    emailModalBorderRadius,
    discountModalBorderRadius,
    requireEmailToClaim,
    requireName,
    emailModalHeadingText,
    emailModalHeadingColor,
    emailModalHeadingSize,
    emailModalHeadingWeight,
    emailModalDescriptionText,
    emailModalDescriptionColor,
    emailModalDescriptionSize,
    emailModalDescriptionWeight,
    emailModalSubmitText,
    emailModalSubmitColor,
    emailModalSubmitSize,
    emailModalSubmitWeight,
    emailModalCancelText,
    emailModalCancelColor,
    emailModalCancelSize,
    emailModalCancelWeight,
    emailModalBgColor,
    emailModalSubmitBgColor,
    emailModalCancelBgColor,
    discountModalHeadingText,
    discountModalHeadingColor,
    discountModalHeadingSize,
    discountModalHeadingWeight,
    discountModalCloseText,
    discountModalCloseColor,
    discountModalCloseSize,
    discountModalCloseWeight,
    discountModalBgColor,
    discountModalCloseBgColor,
    discountModalDescriptionText,
    discountModalDescriptionColor,
    discountModalDescriptionSize,
    discountModalDescriptionWeight,
  ]);

  // Dropdown options
  const textSizeOptions = [
    { label: '12px', value: '12' },
    { label: '14px', value: '14' },
    { label: '16px', value: '16' },
    { label: '18px', value: '18' },
    { label: '20px', value: '20' },
    { label: '24px', value: '24' },
    { label: '28px', value: '28' },
    { label: '32px', value: '32' },
    { label: '36px', value: '36' },
    { label: '40px', value: '40' },
    { label: '48px', value: '48' },
  ];

  const fontWeightOptions = [
    { label: 'Light (300)', value: '300' },
    { label: 'Normal (400)', value: '400' },
    { label: 'Medium (500)', value: '500' },
    { label: 'Semi-bold (600)', value: '600' },
    { label: 'Bold (700)', value: '700' },
    { label: 'Extra-bold (800)', value: '800' },
  ];

  const popupDelayOptions = [
    { label: 'Immediately', value: '0' },
    { label: 'After 3 seconds', value: '3' },
    { label: 'After 5 seconds', value: '5' },
    { label: 'After 10 seconds', value: '10' },
    { label: 'After 15 seconds', value: '15' },
    { label: 'After 30 seconds', value: '30' },
    { label: 'After 60 seconds', value: '60' },
  ];

  // Update settings when selected game changes
  useEffect(() => {
    const current = getCurrentGameSettings(selectedGame);
    const newDifficulty = current.gameDifficulty ?? 50;
    setGameDifficulty(newDifficulty);
    setDifficultySlider(getDifficultySliderPosition(newDifficulty, selectedGame));
    setPopupText(current.popupText ?? "Discount Game");
    setBackgroundColor(current.backgroundColor ?? "#ffffff");
    setBallColor(current.ballColor ?? "#000000");
    setObstacleColor(current.obstacleColor ?? "#ff0000");
    setBorderRadius(current.borderRadius ?? 10);
    setGameAreaBorderRadius(current.gameAreaBorderRadius ?? 10);
    setGameEndBorderRadius(current.gameEndBorderRadius ?? 10);
    setEmailModalBorderRadius(current.emailModalBorderRadius ?? 10);
    setDiscountModalBorderRadius(current.discountModalBorderRadius ?? 10);
    const validMaxDiscountValues = ['15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75'];
    const currentMaxDiscount = current.maxDiscount ?? "35";
    setMaxDiscount(validMaxDiscountValues.includes(currentMaxDiscount) ? currentMaxDiscount : "35");
    setCountdownTime(current.countdownTime ?? 10);
    
    // Text settings
    setMainText(current.mainText ?? "Discount Game");
    setMainTextSize(current.mainTextSize ?? "24");
    setMainTextColor(current.mainTextColor ?? "#000000");
    setMainTextBgColor(current.mainTextBgColor ?? "#ffffff");
    setMainTextWeight(current.mainTextWeight ?? "600");
    setSecondaryText(current.secondaryText ?? "Discount:");
    setSecondaryTextColor(current.secondaryTextColor ?? "#000000");
    setSecondaryTextSize(current.secondaryTextSize ?? "18");
    setSecondaryTextWeight(current.secondaryTextWeight ?? "400");
    setRulesText(current.rulesText ?? "1 Score - 1% Discount");
    setRulesTextColor(current.rulesTextColor ?? "#000000");
    setRulesTextSize(current.rulesTextSize ?? "14");
    setRulesTextWeight(current.rulesTextWeight ?? "400");
    setInstructionText(current.instructionText ?? "Click to Bounce");
    setInstructionTextColor(current.instructionTextColor ?? "#000000");
    setInstructionTextSize(current.instructionTextSize ?? "16");
    setInstructionTextWeight(current.instructionTextWeight ?? "400");
    setGameEndText(current.gameEndText ?? "Your Discount");
    setGameEndTextColor(current.gameEndTextColor ?? "#000000");
    setGameEndTextSize(current.gameEndTextSize ?? "20");
    setGameEndTextWeight(current.gameEndTextWeight ?? "400");
    setButtonText(current.buttonText ?? "Play Again");
    setButtonTextColor(current.buttonTextColor ?? "#ffffff");
    setButtonTextSize(current.buttonTextSize ?? "16");
    setButtonTextWeight(current.buttonTextWeight ?? "500");
    setClaimBestButtonText(current.claimBestButtonText ?? "Claim Best Discount");
    setClaimBestButtonTextColor(current.claimBestButtonTextColor ?? "#ffffff");
    setClaimBestButtonTextSize(current.claimBestButtonTextSize ?? "16");
    setClaimBestButtonTextWeight(current.claimBestButtonTextWeight ?? "500");
    setGameEndTabBgColor(current.gameEndTabBgColor ?? "#ffffff");
    setButtonBgColor(current.buttonBgColor ?? "#000000");
    setClaimBestButtonBgColor(current.claimBestButtonBgColor ?? "#000000");
    
    // Email Modal Settings
    setEmailModalHeadingText(current.emailModalHeadingText ?? "Enter Your Email");
    setEmailModalHeadingColor(current.emailModalHeadingColor ?? "#333333");
    setEmailModalHeadingSize(current.emailModalHeadingSize ?? "20");
    setEmailModalHeadingWeight(current.emailModalHeadingWeight ?? "600");
    setEmailModalDescriptionText(current.emailModalDescriptionText ?? "Please enter your email to claim your discount:");
    setEmailModalDescriptionColor(current.emailModalDescriptionColor ?? "#333333");
    setEmailModalDescriptionSize(current.emailModalDescriptionSize ?? "14");
    setEmailModalDescriptionWeight(current.emailModalDescriptionWeight ?? "400");
    setEmailModalSubmitText(current.emailModalSubmitText ?? "Submit");
    setEmailModalSubmitColor(current.emailModalSubmitColor ?? "#ffffff");
    setEmailModalSubmitSize(current.emailModalSubmitSize ?? "16");
    setEmailModalSubmitWeight(current.emailModalSubmitWeight ?? "500");
    setEmailModalCancelText(current.emailModalCancelText ?? "Cancel");
    setEmailModalCancelColor(current.emailModalCancelColor ?? "#333333");
    setEmailModalCancelSize(current.emailModalCancelSize ?? "16");
    setEmailModalCancelWeight(current.emailModalCancelWeight ?? "500");
    setEmailModalBgColor(current.emailModalBgColor ?? "#ffffff");
    setEmailModalSubmitBgColor(current.emailModalSubmitBgColor ?? "#000000");
    setEmailModalCancelBgColor(current.emailModalCancelBgColor ?? "#cccccc");
    
    // Discount Code Modal Settings
    setDiscountModalHeadingText(current.discountModalHeadingText ?? "Your Discount Code");
    setDiscountModalHeadingColor(current.discountModalHeadingColor ?? "#333333");
    setDiscountModalHeadingSize(current.discountModalHeadingSize ?? "20");
    setDiscountModalHeadingWeight(current.discountModalHeadingWeight ?? "600");
    setDiscountModalCloseText(current.discountModalCloseText ?? "Close");
    setDiscountModalCloseColor(current.discountModalCloseColor ?? "#ffffff");
    setDiscountModalCloseSize(current.discountModalCloseSize ?? "16");
    setDiscountModalCloseWeight(current.discountModalCloseWeight ?? "500");
    setDiscountModalBgColor(current.discountModalBgColor ?? "#ffffff");
    setDiscountModalCloseBgColor(current.discountModalCloseBgColor ?? "#000000");
    setDiscountModalDescriptionText(current.discountModalDescriptionText ?? "Copy your code and use it at checkout");
    setDiscountModalDescriptionColor(current.discountModalDescriptionColor ?? "#333333");
    setDiscountModalDescriptionSize(current.discountModalDescriptionSize ?? "14");
    setDiscountModalDescriptionWeight(current.discountModalDescriptionWeight ?? "400");
  }, [selectedGame, settings.bouncingBallSettings, settings.horizontalLinesSettings, settings.reactionClickSettings]);

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccessBanner(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => setShowSuccessBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);

  // Load Poppins font for preview
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(link);
    
    return () => {
      // Cleanup: remove link when component unmounts (optional)
      const existingLink = document.querySelector(`link[href="${link.href}"]`);
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("selectedGame", selectedGame);
    formData.append("enabled", "true"); // Keep enabled for now
    formData.append("emailRequired", emailRequired.toString());
    formData.append("gameDifficulty", gameDifficulty.toString());
    formData.append("popupText", popupText);
    formData.append("backgroundColor", backgroundColor);
    formData.append("ballColor", ballColor);
    formData.append("obstacleColor", obstacleColor);
    formData.append("borderRadius", borderRadius.toString());
    formData.append("gameAreaBorderRadius", gameAreaBorderRadius.toString());
    formData.append("gameEndBorderRadius", gameEndBorderRadius.toString());
    formData.append("emailModalBorderRadius", emailModalBorderRadius.toString());
    formData.append("discountModalBorderRadius", discountModalBorderRadius.toString());
    formData.append("maxDiscount", maxDiscount);
    formData.append("countdownTime", countdownTime.toString());
    
    // Text settings
    formData.append("mainText", mainText);
    formData.append("mainTextSize", mainTextSize);
    formData.append("mainTextColor", mainTextColor);
    formData.append("mainTextBgColor", mainTextBgColor);
    formData.append("mainTextWeight", mainTextWeight);
    formData.append("secondaryText", secondaryText);
    formData.append("secondaryTextColor", secondaryTextColor);
    formData.append("secondaryTextSize", secondaryTextSize);
    formData.append("secondaryTextWeight", secondaryTextWeight);
    formData.append("rulesText", rulesText);
    formData.append("rulesTextColor", rulesTextColor);
    formData.append("rulesTextSize", rulesTextSize);
    formData.append("rulesTextWeight", rulesTextWeight);
    formData.append("instructionText", instructionText);
    formData.append("instructionTextColor", instructionTextColor);
    formData.append("instructionTextSize", instructionTextSize);
    formData.append("instructionTextWeight", instructionTextWeight);
    formData.append("gameEndText", gameEndText);
    formData.append("gameEndTextColor", gameEndTextColor);
    formData.append("gameEndTextSize", gameEndTextSize);
    formData.append("gameEndTextWeight", gameEndTextWeight);
    formData.append("buttonText", buttonText);
    formData.append("buttonTextColor", buttonTextColor);
    formData.append("buttonTextSize", buttonTextSize);
    formData.append("buttonTextWeight", buttonTextWeight);
    formData.append("claimBestButtonText", claimBestButtonText);
    formData.append("claimBestButtonTextColor", claimBestButtonTextColor);
    formData.append("claimBestButtonTextSize", claimBestButtonTextSize);
    formData.append("claimBestButtonTextWeight", claimBestButtonTextWeight);
    formData.append("gameEndTabBgColor", gameEndTabBgColor);
    formData.append("buttonBgColor", buttonBgColor);
    formData.append("claimBestButtonBgColor", claimBestButtonBgColor);
    formData.append("requireEmailToClaim", requireEmailToClaim.toString());
    formData.append("requireName", requireName.toString());
    formData.append("discountCodePrefix", discountCode);
    formData.append("logoUrl", logoUrl || '');
    
    // Sticky Button Settings
    formData.append("showStickyButton", showStickyButton.toString());
    formData.append("stickyButtonText", stickyButtonText);
    formData.append("stickyButtonColor", stickyButtonColor);
    formData.append("stickyButtonDisplayPage", stickyButtonDisplayPage);
    formData.append("stickyButtonShowOnDesktop", stickyButtonShowOnDesktop.toString());
    formData.append("stickyButtonShowOnMobile", stickyButtonShowOnMobile.toString());
    
    // Email Modal Settings
    formData.append("emailModalHeadingText", emailModalHeadingText);
    formData.append("emailModalHeadingColor", emailModalHeadingColor);
    formData.append("emailModalHeadingSize", emailModalHeadingSize);
    formData.append("emailModalHeadingWeight", emailModalHeadingWeight);
    formData.append("emailModalDescriptionText", emailModalDescriptionText);
    formData.append("emailModalDescriptionColor", emailModalDescriptionColor);
    formData.append("emailModalDescriptionSize", emailModalDescriptionSize);
    formData.append("emailModalDescriptionWeight", emailModalDescriptionWeight);
    formData.append("emailModalSubmitText", emailModalSubmitText);
    formData.append("emailModalSubmitColor", emailModalSubmitColor);
    formData.append("emailModalSubmitSize", emailModalSubmitSize);
    formData.append("emailModalSubmitWeight", emailModalSubmitWeight);
    formData.append("emailModalCancelText", emailModalCancelText);
    formData.append("emailModalCancelColor", emailModalCancelColor);
    formData.append("emailModalCancelSize", emailModalCancelSize);
    formData.append("emailModalCancelWeight", emailModalCancelWeight);
    formData.append("emailModalBgColor", emailModalBgColor);
    formData.append("emailModalSubmitBgColor", emailModalSubmitBgColor);
    formData.append("emailModalCancelBgColor", emailModalCancelBgColor);
    
    // Discount Code Modal Settings
    formData.append("discountModalHeadingText", discountModalHeadingText);
    formData.append("discountModalHeadingColor", discountModalHeadingColor);
    formData.append("discountModalHeadingSize", discountModalHeadingSize);
    formData.append("discountModalHeadingWeight", discountModalHeadingWeight);
    formData.append("discountModalCloseText", discountModalCloseText);
    formData.append("discountModalCloseColor", discountModalCloseColor);
    formData.append("discountModalCloseSize", discountModalCloseSize);
    formData.append("discountModalCloseWeight", discountModalCloseWeight);
    formData.append("discountModalBgColor", discountModalBgColor);
    formData.append("discountModalCloseBgColor", discountModalCloseBgColor);
    formData.append("discountModalDescriptionText", discountModalDescriptionText);
    formData.append("discountModalDescriptionColor", discountModalDescriptionColor);
    formData.append("discountModalDescriptionSize", discountModalDescriptionSize);
    formData.append("discountModalDescriptionWeight", discountModalDescriptionWeight);
    
    fetcher.submit(formData, { method: "POST" });
  };

  const games = [
    { value: "horizontal-lines", label: "Pass the Gaps" },
    { value: "reaction-click", label: "Reaction Click" },
    { value: "bouncing-ball", label: "Spike Dodge" },
  ];

  const getGameName = (gameValue: string) => {
    const gameNames: Record<string, string> = {
      "horizontal-lines": "Pass the Gaps",
      "reaction-click": "Reaction Click",
      "bouncing-ball": "Spike Dodge",
    };
    return gameNames[gameValue] || "Choose the Game";
  };

  const hasObstacles = selectedGame !== "reaction-click";

  return (
    <Page title="">
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          {showSuccessBanner && (
            <Banner tone="success" onDismiss={() => setShowSuccessBanner(false)}>
              Settings saved successfully!
            </Banner>
          )}

          {/* 1. Game Preview */}
          <div style={{
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            {/* Preview Mode Toggle Buttons */}
            <ButtonGroup variant="segmented">
              <Button
                onClick={() => setPreviewMode('desktop')}
                variant="secondary"
                pressed={previewMode === 'desktop'}
                icon={DesktopIcon}
              >
                Desktop Preview
              </Button>
              <Button
                onClick={() => setPreviewMode('mobile')}
                variant="secondary"
                pressed={previewMode === 'mobile'}
                icon={MobileIcon}
              >
                Mobile Preview
              </Button>
            </ButtonGroup>

            {/* Preview Container */}
            <div style={{
              width: '100%',
              maxWidth: previewMode === 'desktop' ? '1200px' : '400px',
              backgroundColor: '#858585', // Gray background representing website area
              padding: '40px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: previewMode === 'desktop' ? '800px' : '600px',
              minHeight: previewMode === 'desktop' ? '800px' : '600px',
              position: 'relative', // Add this for absolute positioning of sticky button
            }}>
              {/* Sticky Button */}
              {showStickyButton && (
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '50%',
                  zIndex: 10,
                }}>
                  <button
                    style={{
                      backgroundColor: stickyButtonColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '0px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      whiteSpace: 'nowrap',
                      transform: 'rotate(-90deg) translateY(-50%)',
                      transformOrigin: 'center right',
                    }}
                  >
                    {stickyButtonText || 'Discount Game'}
                  </button>
                </div>
              )}

              <div style={{
                width: previewMode === 'desktop' ? '80%' : '375px',
                maxWidth: previewMode === 'desktop' ? '900px' : '300px',
                background: 'white',
                borderRadius: borderRadius + 'px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                border: '0px solid #e1e3e5',
                transition: 'width 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Optional: add shadow for depth
                height: previewMode === 'desktop' ? '564px' : '484px', // Fixed height: header (~64px) + game (500px/420px)
              }}>
                {/* Preview Logo */}
                {logoUrl && logoUrl.trim() !== '' && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #e0e0e0',
                    flexShrink: 0, // Don't shrink - matches website
                  }}>
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      style={{
                        maxWidth: '200px',
                        maxHeight: '100px',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        console.error('Failed to load logo in preview:', logoUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Preview Popup Header */}
                <div style={{
                  backgroundColor: mainTextBgColor,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: 'none',
                  flexShrink: 0, // Don't shrink - matches website
                }}>
                  <div style={{
                    color: mainTextColor,
                    fontSize: mainTextSize + 'px',
                    lineHeight: mainTextSize + 'px',
                    margin: 0,
                    padding: 0,
                    fontWeight: parseInt(mainTextWeight) || 600,
                    fontFamily: "'Poppins', sans-serif",
                    textAlign: 'center',
                    width: '100%',
                  }}>
                    {mainText}
                  </div>
                </div>

                {/* Preview Game Iframe */}
                {previewGameUrl && (
                  <div style={{
                    width: '100%',
                    flex: 1, // Take remaining space - matches website
                    minHeight: 0, // Allow flexbox to shrink it
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <iframe
                      key={`preview-${previewMode}-${previewGameUrl}`}
                      src={previewGameUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                      title="Game Preview"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Container - matches preview width */}
          <div style={{
            width: '100%',
            maxWidth: '900px',
            margin: '6px auto 0 auto',
          }}>
            {/* 2. Game Selection Card */}
            <Card>
            <BlockStack gap="400">
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <Text variant="headingXl" as="h2">
                  Game Selected: <span style={{ color: '#28ba6c' }}>{getGameName(selectedGame)}</span>
                </Text>
              </div>
              <InlineGrid columns={3} gap="400">
                {games.map((game) => (
                  <div
                    key={game.value}
                    onClick={() => setSelectedGame(game.value)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "8px",
                      padding: "25px",
                      paddingTop: "25px",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div style={{
                      transform: "scale(1.5)",
                      transformOrigin: "center",
                      border: selectedGame === game.value 
                        ? "3px solid #28ba6c" 
                        : "3px solid transparent",
                      borderRadius: "10px",
                      padding: "0px",
                      transition: "all 0.2s",
                    }}>
                      <Thumbnail
                        source={`/game-thumbnails/${game.value}-thumbnail.png`}
                        alt={game.label}
                        size="large"
                      />
                    </div>
                    <div style={{
                      textAlign: "center",
                      marginTop: "32px",
                      marginBottom: "-30px",
                      fontSize: "16px",
                      fontWeight: selectedGame === game.value ? "600" : "400",
                      color: selectedGame === game.value ? "#28ba6c" : "inherit",
                    }}>
                      {game.label}
                    </div>
                  </div>
                ))}
              </InlineGrid>
              
              {/* Divider */}
              <div style={{
                height: '1px',
                backgroundColor: '#e1e3e5',
                marginTop: '10px',
                margin: '4px 0',
              }} />
              
              {/* Game Difficulty (hidden for reaction-click) */}
              {selectedGame !== "reaction-click" && (
                <BlockStack gap="300">
                  <div style={{ textAlign: 'center' }}>
                    <Text variant="headingLg" as="h2">
                      Game Difficulty
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    {getDifficultyLabels(selectedGame).map((label, index) => (
                      <RadioButton
                        key={index}
                        label={label}
                        checked={difficultySlider === index}
                        onChange={() => {
                          setDifficultySlider(index);
                          const difficultyValue = getDifficultyFromSlider(index, selectedGame);
                          setGameDifficulty(difficultyValue);
                        }}
                        id={`difficulty-${selectedGame}-${index}`}
                      />
                    ))}
                  </div>
                </BlockStack>
              )}

              {/* Countdown Time (only for reaction-click) */}
              {selectedGame === "reaction-click" && (
                <BlockStack gap="200">
                  <div style={{ textAlign: 'center' }}>
                    <Text variant="headingLg" as="h2">
                      Game Difficulty
                    </Text>
                  </div>
                  <RangeSlider
                    label={`Countdown Time ${countdownTime} seconds`}
                    value={countdownTime}
                    onChange={setCountdownTime}
                    min={5}
                    max={15}
                    step={1}
                    output
                  />
                </BlockStack>
              )}

              {/* Divider above Maximum Discount Win */}
              <div style={{
                height: '1px',
                backgroundColor: '#e1e3e5',
                marginTop: '0px',
                marginBottom: '0px',
              }} />

              {/* Maximum Discount Win (for all games) */}
              <BlockStack gap="300">
                <div style={{ textAlign: 'center' }}>
                  <Text variant="headingMd" as="h2">
                    Maximum Discount Win
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  {['15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75'].map((value) => (
                    <RadioButton
                      key={value}
                      label={`${value}%`}
                      checked={maxDiscount === value}
                      onChange={() => setMaxDiscount(value)}
                      id={`maxDiscount-${value}`}
                    />
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', marginTop: '0px' }}>
                  Game ends with confetti when {maxDiscount}% is reached
                </div>
              </BlockStack>

            </BlockStack>
          </Card>

          {/* 3. Text Settings */}
          <div style={{ marginTop: '24px' }}>
          <Card>
            <BlockStack gap="400">
            <div style={{ textAlign: "center", marginTop: '10px' }}>
              <Text variant="headingXl" as="h2">
                Content and Style
              </Text>
              </div>
              
              {/* Pop Up Settings Card */}
              <div style={{ marginTop: '6px' }}>
                <Card>
                  <BlockStack gap="400">
                    <div style={{ textAlign: "center", marginBottom: "-6px" }}>
                      <Text variant="headingLg" as="h2">Pop Up Header</Text>
                    </div>
                    
                    {/* Logo URL Input */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="200">
                        <Text variant="headingMd" as="p" alignment="center">Logo Image URL</Text>
                        <TextField
                          label=""
                          value={logoUrl}
                          onChange={setLogoUrl}
                          placeholder="https://example.com/logo.png"
                          autoComplete="off"
                          helpText="Enter a URL to an image that will appear above the pop-up header"
                        />
                        {logoUrl && (
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                            <Thumbnail
                              source={logoUrl}
                              alt="Logo preview"
                              size="medium"
                            />
                          </div>
                        )}
                      </BlockStack>
                    </div>
                    
                    {/* Pop Up Text Settings - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Pop Up Text</Text>
                            <TextField
                              label=""
                              value={mainText}
                              onChange={setMainText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={mainTextSize}
                              onChange={setMainTextSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={mainTextWeight}
                              onChange={setMainTextWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Main Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={mainTextColor}
                              onInput={(e) => setMainTextColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Pop Up Background Color and Border Radius - 2 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={2} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Background Color</Text>
                            <s-color-field
                              label="Main Text Background Color"
                              labelAccessibilityVisibility="exclusive"
                              value={mainTextBgColor}
                              onInput={(e) => setMainTextBgColor(e.currentTarget.value)}
                              placeholder="#ffffff"
                            />
                          </BlockStack>
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="p">Border Radius</Text>
                            <RangeSlider
                              label=""
                              value={borderRadius}
                              onChange={setBorderRadius}
                              min={0}
                              max={25}
                              output
                              suffix="px"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>
                  </BlockStack>
                </Card>
              </div>

              {/* Game Area Settings Card */}
              <div style={{ marginTop: '6px' }}>
                <Card>
                  <BlockStack gap="400">
                    <div style={{ textAlign: "center", marginBottom: "-6px" }}>
                      <Text variant="headingLg" as="h2">Game Screen</Text>
                    </div>
                    
                    {/* Game Colors - 3 column grid for games with obstacles, 2 column for reaction-click */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={hasObstacles ? 3 : 2} gap="400">
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="h2">
                              Game Background Color
                            </Text>
                            <s-color-field
                              label="Game Background Color"
                              labelAccessibilityVisibility="exclusive"
                              value={backgroundColor}
                              onInput={(e) => setBackgroundColor(e.currentTarget.value)}
                              placeholder="#ffffff"
                            />
                          </BlockStack>
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="h2">
                              Game Ball Color
                            </Text>
                            <s-color-field
                              label="Game Ball Color"
                              labelAccessibilityVisibility="exclusive"
                              value={ballColor}
                              onInput={(e) => setBallColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                          {hasObstacles && (
                            <BlockStack gap="200">
                              <Text variant="headingMd" as="h2">
                                Game Obstacles Color
                              </Text>
                              <s-color-field
                                label="Game Obstacles Color"
                                labelAccessibilityVisibility="exclusive"
                                value={obstacleColor}
                                onInput={(e) => setObstacleColor(e.currentTarget.value)}
                                placeholder="#ff0000"
                              />
                            </BlockStack>
                          )}
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Score Text Settings - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Score Display Text</Text>
                            <TextField
                              label=""
                              value={secondaryText}
                              onChange={setSecondaryText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={secondaryTextSize}
                              onChange={setSecondaryTextSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={secondaryTextWeight}
                              onChange={setSecondaryTextWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Secondary Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={secondaryTextColor}
                              onInput={(e) => setSecondaryTextColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Rules Text Settings - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Rules Text (Preview)</Text>
                            <TextField
                              label=""
                              value={rulesText}
                              onChange={setRulesText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={rulesTextSize}
                              onChange={setRulesTextSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={rulesTextWeight}
                              onChange={setRulesTextWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Rules Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={rulesTextColor}
                              onInput={(e) => setRulesTextColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Instruction Text Settings - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Guide Text (Preview)</Text>
                            <TextField
                              label=""
                              value={instructionText}
                              onChange={setInstructionText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={instructionTextSize}
                              onChange={setInstructionTextSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={instructionTextWeight}
                              onChange={setInstructionTextWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Instruction Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={instructionTextColor}
                              onInput={(e) => setInstructionTextColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Results Modal Section */}
                    <div style={{ textAlign: "center", marginBottom: "-6px", marginTop: '6px' }}>
                      <Text variant="headingLg" as="h2">Results Screen</Text>
                    </div>
                    
                    {/* Game End Text Settings - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Results Text</Text>
                            <TextField
                              label=""
                              value={gameEndText}
                              onChange={setGameEndText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={gameEndTextSize}
                              onChange={setGameEndTextSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={gameEndTextWeight}
                              onChange={setGameEndTextWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Game End Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={gameEndTextColor}
                              onInput={(e) => setGameEndTextColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Restart Button Text Settings - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Button 1 Text</Text>
                            <TextField
                              label=""
                              value={buttonText}
                              onChange={setButtonText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={buttonTextSize}
                              onChange={setButtonTextSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={buttonTextWeight}
                              onChange={setButtonTextWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Button Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={buttonTextColor}
                              onInput={(e) => setButtonTextColor(e.currentTarget.value)}
                              placeholder="#ffffff"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Claim Discount Button Text Settings - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Button 2 Text</Text>
                            <TextField
                              label=""
                              value={claimBestButtonText}
                              onChange={setClaimBestButtonText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={claimBestButtonTextSize}
                              onChange={setClaimBestButtonTextSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={claimBestButtonTextWeight}
                              onChange={setClaimBestButtonTextWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Claim Best Button Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={claimBestButtonTextColor}
                              onInput={(e) => setClaimBestButtonTextColor(e.currentTarget.value)}
                              placeholder="#ffffff"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Game End Background Colors - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Background Color</Text>
                            <s-color-field
                              label="Game End Tab Background Color"
                              labelAccessibilityVisibility="exclusive"
                              value={gameEndTabBgColor}
                              onInput={(e) => setGameEndTabBgColor(e.currentTarget.value)}
                              placeholder="#ffffff"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Button 1 Color</Text>
                            <s-color-field
                              label="Play Again Button Color"
                              labelAccessibilityVisibility="exclusive"
                              value={buttonBgColor}
                              onInput={(e) => setButtonBgColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Button 2 Color</Text>
                            <s-color-field
                              label="Claim Discount Button Color"
                              labelAccessibilityVisibility="exclusive"
                              value={claimBestButtonBgColor}
                              onInput={(e) => setClaimBestButtonBgColor(e.currentTarget.value)}
                              placeholder="#000000"
                            />
                          </BlockStack>
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="p">Border Radius</Text>
                            <RangeSlider
                              label=""
                              value={gameEndBorderRadius}
                              onChange={setGameEndBorderRadius}
                              min={0}
                              max={25}
                              output
                              suffix="px"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>
                  </BlockStack>
                </Card>
              </div>

              {/* Email Requirement Section */}
              <div style={{ marginTop: '0px', marginBottom: '0px', display: 'flex', justifyContent: 'center' }}>
                <InlineStack gap="400" align="center">
                  <span style={{ fontSize: '15px', fontFamily: 'inherit', fontWeight: '600', marginTop: '4px' }}>Earned Discount Claim Form:</span>
                  <Checkbox
                    label="Require Email"
                    checked={requireEmailToClaim}
                    onChange={setRequireEmailToClaim}
                  />
                  <Checkbox
                    label="Require Name"
                    checked={requireName}
                    onChange={setRequireName}
                  />
                </InlineStack>
              </div>

              {/* Modals Card - Email and Discount Code */}
              <div style={{ marginTop: '0px' }}>
                <Card>
                  <BlockStack gap="400">
                    {/* Email Modal Section */}
                    <div style={{ textAlign: "center", marginBottom: "-6px" }}>
                      <Text variant="headingLg" as="h2">Claim Form Window</Text>
                    </div>
                    
                    {/* Email Modal Heading - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Primary Text</Text>
                            <TextField
                              label=""
                              value={emailModalHeadingText}
                              onChange={setEmailModalHeadingText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={emailModalHeadingSize}
                              onChange={setEmailModalHeadingSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={emailModalHeadingWeight}
                              onChange={setEmailModalHeadingWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Email Modal Heading Color"
                              labelAccessibilityVisibility="exclusive"
                              value={emailModalHeadingColor}
                              onInput={(e) => setEmailModalHeadingColor(e.currentTarget.value)}
                              placeholder="#333333"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Email Modal Description - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Secondary Text</Text>
                            <TextField
                              label=""
                              value={emailModalDescriptionText}
                              onChange={setEmailModalDescriptionText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={emailModalDescriptionSize}
                              onChange={setEmailModalDescriptionSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={emailModalDescriptionWeight}
                              onChange={setEmailModalDescriptionWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Email Modal Description Color"
                              labelAccessibilityVisibility="exclusive"
                              value={emailModalDescriptionColor}
                              onInput={(e) => setEmailModalDescriptionColor(e.currentTarget.value)}
                              placeholder="#333333"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Email Modal Submit Button - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Button 1 Text</Text>
                            <TextField
                              label=""
                              value={emailModalSubmitText}
                              onChange={setEmailModalSubmitText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={emailModalSubmitSize}
                              onChange={setEmailModalSubmitSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={emailModalSubmitWeight}
                              onChange={setEmailModalSubmitWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Email Modal Submit Button Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={emailModalSubmitColor}
                              onInput={(e) => setEmailModalSubmitColor(e.currentTarget.value)}
                              placeholder="#ffffff"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Email Modal Cancel Button - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Button 2 Text</Text>
                            <TextField
                              label=""
                              value={emailModalCancelText}
                              onChange={setEmailModalCancelText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={emailModalCancelSize}
                              onChange={setEmailModalCancelSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={emailModalCancelWeight}
                              onChange={setEmailModalCancelWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Email Modal Cancel Button Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={emailModalCancelColor}
                              onInput={(e) => setEmailModalCancelColor(e.currentTarget.value)}
                              placeholder="#333333"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Email Modal Colors - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="p">Background Color</Text>
                            <BlockStack gap="100">
                              <s-color-field
                                label="Email Modal Background Color"
                                labelAccessibilityVisibility="exclusive"
                                value={emailModalBgColor}
                                onInput={(e) => setEmailModalBgColor(e.currentTarget.value)}
                                placeholder="#ffffff"
                              />
                            </BlockStack>
                          </BlockStack>
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="p">Button 1 Color</Text>
                            <BlockStack gap="100">
                              <s-color-field
                                label="Email Modal Submit Button Color"
                                labelAccessibilityVisibility="exclusive"
                                value={emailModalSubmitBgColor}
                                onInput={(e) => setEmailModalSubmitBgColor(e.currentTarget.value)}
                                placeholder="#000000"
                              />
                            </BlockStack>
                          </BlockStack>
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="p">Button 2 Color</Text>
                            <BlockStack gap="100">
                              <s-color-field
                                label="Email Modal Cancel Button Color"
                                labelAccessibilityVisibility="exclusive"
                                value={emailModalCancelBgColor}
                                onInput={(e) => setEmailModalCancelBgColor(e.currentTarget.value)}
                                placeholder="#cccccc"
                              />
                            </BlockStack>
                          </BlockStack>
                          <BlockStack gap="300">
                            <Text variant="headingMd" as="p">Border Radius</Text>
                            <RangeSlider
                              label=""
                              value={emailModalBorderRadius}
                              onChange={setEmailModalBorderRadius}
                              min={0}
                              max={25}
                              output
                              suffix="px"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Discount Code Modal Section */}
                    <div style={{ textAlign: "center", marginBottom: "-6px", marginTop: '6px' }}>
                      <Text variant="headingLg" as="h2">Discount Code Window</Text>
                    </div>
                    
                    {/* Discount Code Setting */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            {/* Empty column 1 */}
                          </BlockStack>
                          <div style={{ gridColumn: 'span 2' }}>
                            <BlockStack gap="200">
                              <div style={{ textAlign: 'center' }}>
                                <Text variant="headingMd" as="h2">Code Name</Text>
                              </div>
                              <TextField
                                label=""
                                value={discountCode}
                                onChange={setDiscountCode}
                                autoComplete="off"
                              />
                              <div style={{ textAlign: 'center', fontSize: '9px', color: '#6B7280', marginTop: '-6px' }}>
                                Generated code example: {discountCode}18345 (Code Name, Earned Discount, Order Number)
                              </div>
                            </BlockStack>
                          </div>
                          <BlockStack gap="100">
                            {/* Empty column 4 */}
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>
                    
                    {/* Discount Modal Heading - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Primary Text</Text>
                            <TextField
                              label=""
                              value={discountModalHeadingText}
                              onChange={setDiscountModalHeadingText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={discountModalHeadingSize}
                              onChange={setDiscountModalHeadingSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={discountModalHeadingWeight}
                              onChange={setDiscountModalHeadingWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Discount Modal Heading Color"
                              labelAccessibilityVisibility="exclusive"
                              value={discountModalHeadingColor}
                              onInput={(e) => setDiscountModalHeadingColor(e.currentTarget.value)}
                              placeholder="#333333"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Discount Modal Description Text - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Secondary Text</Text>
                            <TextField
                              label=""
                              value={discountModalDescriptionText}
                              onChange={setDiscountModalDescriptionText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={discountModalDescriptionSize}
                              onChange={setDiscountModalDescriptionSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={discountModalDescriptionWeight}
                              onChange={setDiscountModalDescriptionWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Discount Modal Description Color"
                              labelAccessibilityVisibility="exclusive"
                              value={discountModalDescriptionColor}
                              onInput={(e) => setDiscountModalDescriptionColor(e.currentTarget.value)}
                              placeholder="#333333"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Discount Modal Close Button - 4 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={4} gap="400">
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="p">Button Text</Text>
                            <TextField
                              label=""
                              value={discountModalCloseText}
                              onChange={setDiscountModalCloseText}
                              autoComplete="off"
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Size</Text>
                            </div>
                            <Select
                              label=""
                              options={textSizeOptions}
                              value={discountModalCloseSize}
                              onChange={setDiscountModalCloseSize}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Weight</Text>
                            </div>
                            <Select
                              label=""
                              options={fontWeightOptions}
                              value={discountModalCloseWeight}
                              onChange={setDiscountModalCloseWeight}
                            />
                          </BlockStack>
                          <BlockStack gap="100">
                            <div style={{ fontWeight: 400 }}>
                              <Text variant="bodyMd" as="p">Text Color</Text>
                            </div>
                            <s-color-field
                              label="Discount Modal Close Button Text Color"
                              labelAccessibilityVisibility="exclusive"
                              value={discountModalCloseColor}
                              onInput={(e) => setDiscountModalCloseColor(e.currentTarget.value)}
                              placeholder="#ffffff"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>

                    {/* Discount Modal Colors - 3 column grid */}
                    <div style={{ marginTop: '6px' }}>
                      <BlockStack gap="300">
                        <InlineGrid columns={3} gap="400">
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="p">Background Color</Text>
                            <BlockStack gap="100">
                              <s-color-field
                                label="Discount Modal Background Color"
                                labelAccessibilityVisibility="exclusive"
                                value={discountModalBgColor}
                                onInput={(e) => setDiscountModalBgColor(e.currentTarget.value)}
                                placeholder="#ffffff"
                              />
                            </BlockStack>
                          </BlockStack>
                          <BlockStack gap="200">
                            <Text variant="headingMd" as="p">Button Color</Text>
                            <BlockStack gap="100">
                              <s-color-field
                                label="Discount Modal Close Button Color"
                                labelAccessibilityVisibility="exclusive"
                                value={discountModalCloseBgColor}
                                onInput={(e) => setDiscountModalCloseBgColor(e.currentTarget.value)}
                                placeholder="#000000"
                              />
                            </BlockStack>
                          </BlockStack>
                          <BlockStack gap="300">
                            <Text variant="headingMd" as="p">Border Radius</Text>
                            <RangeSlider
                              label=""
                              value={discountModalBorderRadius}
                              onChange={setDiscountModalBorderRadius}
                              min={0}
                              max={25}
                              output
                              suffix="px"
                            />
                          </BlockStack>
                        </InlineGrid>
                      </BlockStack>
                    </div>
                  </BlockStack>
                </Card>
              </div>
            </BlockStack>
          </Card>
          </div>

          {/* 4. Display Options */}
          <div style={{ marginTop: '24px' }}>
            <Card>
              <InlineGrid columns={2} gap="400">
                <Card>
                  <BlockStack gap="400">
                    <Checkbox
                      label="Show Auto Pop Up"
                      checked={showAutoPopUp}
                      onChange={setShowAutoPopUp}
                    />
                    <Select
                      label="When to open pop up after page load"
                      options={popupDelayOptions}
                      value={popupDelay}
                      onChange={setPopupDelay}
                    />
                    <InlineStack gap="400">
                      <RadioButton
                        label="Display on any page"
                        checked={popupDisplayPage === 'any'}
                        onChange={() => setPopupDisplayPage('any')}
                        id="popup-page-any"
                      />
                      <RadioButton
                        label="Display on a custom page"
                        checked={popupDisplayPage === 'custom'}
                        onChange={() => setPopupDisplayPage('custom')}
                        id="popup-page-custom"
                      />
                    </InlineStack>
                    <InlineStack gap="400">
                      <Checkbox
                        label="Show on desktop"
                        checked={showOnDesktop}
                        onChange={setShowOnDesktop}
                      />
                      <Checkbox
                        label="Show on mobile"
                        checked={showOnMobile}
                        onChange={setShowOnMobile}
                      />
                    </InlineStack>
                    {popupDisplayPage === 'custom' && (
                      <BlockStack gap="300">
                        {customUrls.map((url, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <TextField
                                label={index === 0 ? "URL" : ""}
                                value={url}
                                onChange={(value) => handleUpdateCustomUrl(index, value)}
                                autoComplete="off"
                                placeholder="Enter custom URL"
                              />
                            </div>
                            {customUrls.length > 1 && (
                              <div style={{ marginTop: index === 0 ? '24px' : '0' }}>
                                <Button
                                  variant="plain"
                                  onClick={() => handleRemoveCustomUrl(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        <Button onClick={handleAddCustomUrl}>
                          Add custom URL
                        </Button>
                      </BlockStack>
                    )}
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="400">
                    <Checkbox
                      label="Show Sticky Button"
                      checked={showStickyButton}
                      onChange={setShowStickyButton}
                    />
                    <InlineGrid columns={2} gap="400">
                      <TextField
                        label="Button text"
                        value={stickyButtonText}
                        onChange={setStickyButtonText}
                        autoComplete="off"
                      />
                      <BlockStack gap="100">
                        <div style={{ fontWeight: 400 }}>
                          <Text variant="bodyMd" as="p">Button color</Text>
                        </div>
                        <s-color-field
                          label="Button color"
                          labelAccessibilityVisibility="exclusive"
                          value={stickyButtonColor}
                          onInput={(e) => setStickyButtonColor(e.currentTarget.value)}
                          placeholder="#000000"
                        />
                      </BlockStack>
                    </InlineGrid>
                    <InlineStack gap="400">
                      <RadioButton
                        label="Display on any page"
                        checked={stickyButtonDisplayPage === 'any'}
                        onChange={() => setStickyButtonDisplayPage('any')}
                        id="sticky-button-page-any"
                      />
                      <RadioButton
                        label="Display on a custom page"
                        checked={stickyButtonDisplayPage === 'custom'}
                        onChange={() => setStickyButtonDisplayPage('custom')}
                        id="sticky-button-page-custom"
                      />
                    </InlineStack>
                    <InlineStack gap="400">
                      <Checkbox
                        label="Show on desktop"
                        checked={stickyButtonShowOnDesktop}
                        onChange={setStickyButtonShowOnDesktop}
                      />
                      <Checkbox
                        label="Show on mobile"
                        checked={stickyButtonShowOnMobile}
                        onChange={setStickyButtonShowOnMobile}
                      />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </InlineGrid>
            </Card>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              submit
              variant="primary"
              loading={fetcher.state === "submitting"}
            >
              Save Settings
            </Button>
          </div>
          </div>  {/* Close Settings Container wrapper */}
        </FormLayout>
      </Form>
    </Page>
  );
}

