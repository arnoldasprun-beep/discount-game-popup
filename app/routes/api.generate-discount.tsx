import type { ActionFunctionArgs } from "react-router";
import { sessionStorage } from "../shopify.server";
import prisma from "../db.server";

// CORS headers for cross-origin requests from storefront
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Request timeout in milliseconds (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Maximum retry attempts for discount code conflicts
const MAX_RETRY_ATTEMPTS = 10;

// Helper function to validate shop domain
function isValidShopDomain(shop: string): boolean {
  // Shopify shop domains should end with .myshopify.com or be a custom domain
  const shopifyDomainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.myshopify\.com$/;
  const customDomainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])+$/;
  return shopifyDomainPattern.test(shop) || customDomainPattern.test(shop);
}

// Helper function to validate email with simple regex and safeguards
function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Normalize: trim once at the start
  email = email.trim();
  if (email.length === 0 || email.length > 254) return false;
  
  // Basic format checks
  if (email.includes(' ')) return false;
  if (email.startsWith('.') || email.startsWith('@')) return false;
  if (email.endsWith('.') || email.endsWith('@')) return false;
  if (email.includes('..')) return false;
  
  // Ensure exactly ONE @ symbol
  if (email.split('@').length !== 2) return false;
  
  // Basic regex check (simple and safe)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return false;
  
  // Split and validate parts
  const [local, domain] = email.split('@');
  
  // Local part checks
  if (!local || local.startsWith('.') || local.endsWith('.')) return false;
  
  // Domain checks
  if (!domain || domain.startsWith('.') || domain.endsWith('.')) return false;
  if (!domain.includes('.')) return false; // Must have dot (explicit check)
  
  // TLD check
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) return false;
  
  return true;
}

// Helper function to create discount code with timeout and retry logic
async function createDiscountCode(
  shop: string,
  session: any,
  discountCode: string,
  percentageNumber: string,
  orderNumber: number
): Promise<{ success: boolean; data?: any; error?: string; isConflict?: boolean }> {
  const graphqlEndpoint = `https://${shop}/admin/api/2025-01/graphql.json`;
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const graphqlResponse = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken,
      },
      body: JSON.stringify({
        query: `#graphql
          mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
            discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
              codeDiscountNode {
                id
                codeDiscount {
                  ... on DiscountCodeBasic {
                    codes(first: 1) {
                      nodes {
                        code
                      }
                    }
                    status
                    usageLimit
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          basicCodeDiscount: {
            title: `Discount Game ${percentageNumber}%`,
            code: discountCode,
            startsAt: new Date().toISOString(),
            customerSelection: {
              all: true,
            },
            customerGets: {
              value: {
                percentage: parseFloat(percentageNumber) / 100, // Convert to decimal (16% = 0.16)
              },
              items: {
                all: true,
              },
            },
            appliesOncePerCustomer: true,
            usageLimit: 1, // One-time use
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const discountData = await graphqlResponse.json();

    // Check HTTP response status
    if (!graphqlResponse.ok) {
      // Check for 401 Unauthorized (session expired)
      if (graphqlResponse.status === 401) {
        return { success: false, error: 'Your session has expired. Please refresh the page and try again.', isConflict: false };
      }
      console.error('GraphQL API error:', graphqlResponse.status, discountData);
      return { 
        success: false, 
        error: `Unable to connect to Shopify. Please try again later.`, 
        isConflict: false 
      };
    }

    // Check for GraphQL errors
    if (discountData.errors) {
      console.error('GraphQL errors:', discountData.errors);
      const errorMessage = discountData.errors[0]?.message || 'An error occurred while creating your discount code.';
      
      // Check if it's an authentication error
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('authentication')) {
        return { success: false, error: 'Your session has expired. Please refresh the page and try again.', isConflict: false };
      }
      
      return { success: false, error: errorMessage, isConflict: false };
    }

    // Check for userErrors from the mutation
    if (discountData.data?.discountCodeBasicCreate?.userErrors?.length > 0) {
      const userError = discountData.data.discountCodeBasicCreate.userErrors[0];
      console.error('User errors:', discountData.data.discountCodeBasicCreate.userErrors);
      
      // Check if it's a code conflict error
      const errorMessage = userError.message.toLowerCase();
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('code')) {
        return { success: false, error: userError.message, isConflict: true };
      }
      
      return { success: false, error: userError.message, isConflict: false };
    }

    // Check if the mutation actually succeeded
    if (!discountData.data?.discountCodeBasicCreate?.codeDiscountNode) {
      console.error('Mutation failed - no discount node returned:', discountData);
      return { 
        success: false, 
        error: 'Unable to create discount code. Please try again.', 
        isConflict: false 
      };
    }

    return { success: true, data: discountData };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Request timed out. Please check your connection and try again.', 
        isConflict: false 
      };
    }
    
    console.error('Error creating discount code:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.', 
      isConflict: false 
    };
  }
}

// Handle OPTIONS preflight requests
export const options = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" }, 
      { status: 405, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return Response.json(
      { error: "Invalid request format. Please try again." },
      { status: 400, headers: corsHeaders }
    );
  }

  const { shop, email, percentage, firstName, lastName, device, gameType, difficulty } = body;

  // Input validation
  if (!shop || !email || percentage === undefined) {
    return Response.json(
      { error: "Missing required information. Please try again." },
      { status: 400, headers: corsHeaders }
    );
  }
  
  // Get requireName setting from database
  let requireName = false;
  try {
    const gameSettings = await prisma.gameSettings.findUnique({
      where: { shop },
    });
    // TypeScript types may be stale - requireName was just added to schema
    requireName = (gameSettings as any)?.requireName ?? false;
  } catch (error) {
    console.error('Error fetching requireName setting:', error);
    // Continue with requireName = false if there's an error
  }
  
  // Validate name fields if required
  if (requireName) {
    if (!firstName || firstName.trim().length === 0) {
      return Response.json(
        { error: "First name is required." },
        { status: 400, headers: corsHeaders }
      );
    }
    if (firstName.trim().length > 50) {
      return Response.json(
        { error: "First name must be 50 characters or less." },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!lastName || lastName.trim().length === 0) {
      return Response.json(
        { error: "Last name is required." },
        { status: 400, headers: corsHeaders }
      );
    }
    if (lastName.trim().length > 50) {
      return Response.json(
        { error: "Last name must be 50 characters or less." },
        { status: 400, headers: corsHeaders }
      );
    }
  }

  // Validate shop domain format
  if (!isValidShopDomain(shop)) {
    return Response.json(
      { error: "Invalid shop domain. Please contact support." },
      { status: 400, headers: corsHeaders }
    );
  }

  // Validate email format (only if email is provided and not placeholder)
  if (email && email !== 'no-email@example.com' && !isValidEmail(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400, headers: corsHeaders }
    );
  }

  // Validate percentage (must be between 1 and 100)
  const percentageNumber = percentage.toString().replace('%', '');
  const percentageValue = parseFloat(percentageNumber);
  
  if (isNaN(percentageValue) || percentageValue < 1 || percentageValue > 100) {
    return Response.json(
      { error: "Discount percentage must be between 1% and 100%." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Get session from database using shop
    const sessions = await sessionStorage.findSessionsByShop(shop);
    if (!sessions || sessions.length === 0) {
      return Response.json(
        { error: "Store connection not found. Please refresh the page and try again." },
        { status: 404, headers: corsHeaders }
      );
    }

    // Use the first active session
    const session = sessions[0];

    // Check if session has access token
    if (!session.accessToken) {
      return Response.json(
        { error: "Store connection expired. Please refresh the page and try again." },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if email has already claimed a discount (only if email is provided and not placeholder)
    if (email && email !== 'no-email@example.com') {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Try findUnique first (using compound key)
      let existingClaim = await prisma.discountClaim.findUnique({
        where: {
          shop_email: {
            shop: shop,
            email: normalizedEmail,
          },
        },
      });
      
      // Fallback: if findUnique doesn't work, try findFirst
      if (!existingClaim) {
        existingClaim = await prisma.discountClaim.findFirst({
          where: {
            shop: shop,
            email: normalizedEmail,
          },
        });
      }

      if (existingClaim) {
        return Response.json(
          { error: "This email has already claimed a discount. Each email can only claim once." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Use database transaction to safely get and increment order number
    let baseOrderNumber: number;
    let discountCode: string = '';
    let retryCount = 0;
    let success = false;
    let discountCodePrefix = "wincode";

    while (retryCount < MAX_RETRY_ATTEMPTS && !success) {
      // Get or create game settings within transaction (only on first attempt)
      if (retryCount === 0) {
        const settings = await prisma.$transaction(async (tx) => {
          let currentSettings = await tx.gameSettings.findUnique({
            where: { shop },
          });

          if (!currentSettings) {
            currentSettings = await tx.gameSettings.create({
              data: {
                shop,
                discountCodeOrderNumber: 345,
                discountCodePrefix: "wincode",
              },
            });
          }

          // Get current order number and discount code prefix
          const currentOrderNumber = currentSettings.discountCodeOrderNumber ?? 345;
          const prefix = currentSettings.discountCodePrefix ?? "wincode";
          
          // Increment order number atomically
          const updatedSettings = await tx.gameSettings.update({
            where: { shop },
            data: {
              discountCodeOrderNumber: currentOrderNumber + 1,
            },
          });

          return { currentOrderNumber, discountCodePrefix: prefix, updatedSettings };
        });

        baseOrderNumber = settings.currentOrderNumber;
        discountCodePrefix = settings.discountCodePrefix ?? "wincode";
      }

      // Add random digit (0-9) on retries to handle duplicate codes from reinstalls
      const orderNumberForCode = retryCount > 0 
        ? parseInt(`${baseOrderNumber}${Math.floor(Math.random() * 10)}`)
        : baseOrderNumber;
      
      discountCode = `${discountCodePrefix}${percentageNumber}${orderNumberForCode}`;

      // Try to create discount code
      const result = await createDiscountCode(
        shop,
        session,
        discountCode,
        percentageNumber,
        baseOrderNumber
      );

      if (result.success) {
        success = true;
        break;
      } else if (result.isConflict && retryCount < MAX_RETRY_ATTEMPTS - 1) {
        // Code conflict - add random digit and retry (handles old codes from reinstalls)
        retryCount++;
        continue;
      } else if (result.isConflict && retryCount >= MAX_RETRY_ATTEMPTS - 1) {
        // Max retries reached due to code conflicts
        console.error(`Failed to create unique discount code after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${result.error}`);
        return Response.json(
          { error: 'Unable to generate a unique discount code. Please try again in a moment.' },
          { status: 400, headers: corsHeaders }
        );
      } else {
        // Other error
        return Response.json(
          { error: result.error || 'Failed to create discount code. Please try again.' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    if (!success) {
      return Response.json(
        { error: 'Unable to create discount code after multiple attempts. Please try again.' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Record the claim in database
    try {
      const normalizedEmail = email.toLowerCase().trim();
      await prisma.discountClaim.create({
        data: {
          shop: shop,
          email: normalizedEmail,
          discountCode: discountCode,
          percentage: parseInt(percentageNumber, 10), // Convert string to integer
          firstName: firstName?.trim() || null,
          lastName: lastName?.trim() || null,
          device: device || null,
          gameType: gameType || null,
          difficulty: difficulty || null,
        },
      });
    } catch (error: any) {
      // Check if it's a unique constraint violation (duplicate email)
      if (error.code === 'P2002' || error.message?.includes('Unique constraint') || error.message?.includes('duplicate')) {
        return Response.json(
          { error: "This email has already claimed a discount. Each email can only claim once." },
          { status: 400, headers: corsHeaders }
        );
      }
      // Log other errors but don't fail the request - discount was already created
      console.error('Error recording discount claim:', error);
      // Note: We still return success since the discount code was created in Shopify
    }

    return Response.json(
      { discountCode, email, success: true },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error creating discount code:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500, headers: corsHeaders }
    );
  }
};
