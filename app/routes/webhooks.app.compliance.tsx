import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

/**
 * Mandatory compliance webhook handler
 * Handles: customers/data_request, customers/redact, shop/redact
 * 
 * According to Shopify's privacy law compliance requirements:
 * - All apps must respond to these webhooks, even if they don't collect customer data
 * - Must respond with 200 status code to acknowledge receipt
 * - Must verify HMAC signatures (done automatically by authenticate.webhook)
 * 
 * For Discount Game app:
 * - customers/data_request: Return customer discount claim data if requested
 * - customers/redact: Delete customer discount claim data
 * - shop/redact: Delete shop data (already handled by app/uninstalled webhook)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  // Verify HMAC signature - this will throw 401 if invalid
  const { shop, topic, payload } = await authenticate.webhook(request);

  // Log for audit purposes
  console.error(`[Compliance Webhook] Received ${topic} for shop: ${shop}`);

  try {
    if (topic === "customers/data_request") {
      // Customer has requested their data
      // Extract customer email from payload
      const customerEmail = (payload as any)?.customer?.email;
      
      if (customerEmail) {
        // Find discount claims for this customer
        const claims = await prisma.discountClaim.findMany({
          where: {
            shop,
            email: customerEmail.toLowerCase().trim(),
          },
        });

        // In a real implementation, you would return this data to the store owner
        // For now, we just acknowledge receipt
        // The data would be sent to the store owner through Shopify's system
        console.error(`[Compliance] Data request for ${customerEmail}: Found ${claims.length} discount claim(s)`);
      }
    } else if (topic === "customers/redact") {
      // Customer has requested deletion of their data
      const customerEmail = (payload as any)?.customer?.email;
      
      if (customerEmail) {
        // Delete discount claims for this customer
        const result = await prisma.discountClaim.deleteMany({
          where: {
            shop,
            email: customerEmail.toLowerCase().trim(),
          },
        });

        console.error(`[Compliance] Redact request for ${customerEmail}: Deleted ${result.count} discount claim(s)`);
      }
    } else if (topic === "shop/redact") {
      // Shop has requested deletion of all data
      // This is already handled by app/uninstalled webhook, but we acknowledge here
      console.error(`[Compliance] Shop redact request for ${shop}: Data deletion handled by uninstall webhook`);
    }
  } catch (error) {
    // Log error but still return 200 to acknowledge receipt
    // Compliance webhooks must always return 200
    console.error(`[Compliance] Error processing ${topic} for shop ${shop}:`, error);
  }

  // Return 200 to acknowledge receipt (required by Shopify)
  return new Response(null, { status: 200 });
};
