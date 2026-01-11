import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type { HeadersFunction } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import * as Polaris from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import prisma from "../db.server";
import { getDefaultGameSettingsData } from "../utils/default-game-settings";

const { AppProvider: PolarisAppProvider } = Polaris;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get or create game settings
  let settings = await prisma.gameSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    // Create complete settings with all defaults
    settings = await prisma.gameSettings.create({
      data: getDefaultGameSettingsData(session.shop),
    });
  }

  // Check app embed status for navigation
  const appEmbedEnabled = settings.appEmbedEnabled;

  // If app embed is already enabled, redirect to settings
  if (settings.appEmbedEnabled) {
    return {
      redirectToSettings: true,
      appEmbedEnabled: true,
      shop: session.shop,
      apiKey: process.env.SHOPIFY_API_KEY || "",
      appEmbedEnabled,
    };
  }

  return {
    redirectToSettings: false,
    appEmbedEnabled: settings.appEmbedEnabled,
    shop: session.shop,
    apiKey: process.env.SHOPIFY_API_KEY || "",
    appEmbedEnabled,
  };
};

export default function Onboarding() {
  const loaderData = useLoaderData<typeof loader>();
  
  const { redirectToSettings, appEmbedEnabled: initialAppEmbedEnabled, shop, apiKey } = loaderData as {
    redirectToSettings: boolean;
    appEmbedEnabled: boolean;
    shop: string;
    apiKey: string;
  };
  const [appEmbedEnabledState, setAppEmbedEnabled] = useState(initialAppEmbedEnabled);
  const navigate = useNavigate();

  // Redirect to settings if app embed is already enabled (prevents direct access to onboarding)
  useEffect(() => {
    if (redirectToSettings) {
      navigate("/app/settings");
    }
  }, [redirectToSettings, navigate]);

  // Page visibility-based app embed check (always runs)
  useEffect(() => {
    let verificationTimeout: NodeJS.Timeout | null = null;

    const checkAppEmbed = async () => {
      const response = await fetch("/app/api/check-app-embed");
      const data = await response.json();
      
      if (data.appEmbedEnabled) {
        if (!appEmbedEnabledState) {
          // Do one more poll to confirm after a short delay
          verificationTimeout = setTimeout(async () => {
            const verifyResponse = await fetch("/app/api/check-app-embed");
            const verifyData = await verifyResponse.json();
            
            if (verifyData.appEmbedEnabled) {
              setAppEmbedEnabled(true);
            }
            // Don't set to enabled if verification fails
          }, 1000);
        }
      } else {
        setAppEmbedEnabled(false);
      }
    };

    // Check when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAppEmbed();
      }
    };

    // Check when window gains focus (user switches back to window)
    const handleFocus = () => {
      checkAppEmbed();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Perform initial check
    checkAppEmbed();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (verificationTimeout) clearTimeout(verificationTimeout);
    };
  }, [appEmbedEnabledState]);

  const handleOpenThemeEditor = () => {
    window.open(`https://${shop}/admin/themes/current/editor?context=apps`, "_blank");
  };

  const handleContinue = () => {
    if (appEmbedEnabledState) {
      navigate("/app/settings");
    }
  };

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={enTranslations}>
        <s-app-nav>
          {!appEmbedEnabledState && <s-link href="/onboarding">Onboarding</s-link>}
          {appEmbedEnabledState && <s-link href="/app/settings">Game Settings</s-link>}
          {appEmbedEnabledState && <s-link href="/app/additional">Analytics</s-link>}
        </s-app-nav>
        <s-page heading="Welcome to Discount Game">
          <s-section>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ textAlign: 'center', margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Getting Started</h2>
              <s-paragraph>
                To enable the discount game popup, open the theme editor → App embeds → Toggle ON "Game Popup" and click Save.
              </s-paragraph>
              
              <s-button
                onClick={handleOpenThemeEditor}
                variant={appEmbedEnabledState ? "secondary" : "primary"}
              >
                Open Theme Editor
              </s-button>
              
              <s-button
                onClick={handleContinue}
                variant={appEmbedEnabledState ? "primary" : "secondary"}
                disabled={!appEmbedEnabledState}
              >
                Continue to Game Settings
              </s-button>

              {!appEmbedEnabledState && (
                <div style={{ fontSize: '0.6rem', color: '#666' }}>
                  Waiting for Game Popup app embed to be enabled in the theme editor...
                </div>
              )}
            </div>
          </s-section>
        </s-page>
      </PolarisAppProvider>
    </AppProvider>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
