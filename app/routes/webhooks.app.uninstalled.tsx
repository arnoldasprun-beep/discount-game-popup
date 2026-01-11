import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Delete all shop-related data
  try {
    await Promise.all([
      // Delete game settings
      db.gameSettings.deleteMany({ where: { shop } }),
      // Delete discount claims (subscribers)
      db.discountClaim.deleteMany({ where: { shop } }),
      // Delete popup view tracking
      db.popupView.deleteMany({ where: { shop } }),
      // Delete game play tracking
      db.gamePlay.deleteMany({ where: { shop } }),
      // Delete shop record (if exists)
      db.shop.deleteMany({ where: { shop } }),
    ]);
  } catch (error) {
    console.error(`Error cleaning up data for shop ${shop}:`, error);
    // Continue even if cleanup fails - session is already deleted above
  }

  return new Response();
};
