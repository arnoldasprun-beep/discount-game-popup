import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";

// CORS headers for cross-origin requests from storefront
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Handle OPTIONS preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(null, { status: 405, headers: corsHeaders });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Handle OPTIONS preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { shop, sessionId, device } = body;

    if (!shop || !sessionId || !device) {
      return Response.json(
        { error: "Missing required fields: shop, sessionId, device" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate device type
    if (device !== "Mobile" && device !== "Desktop") {
      return Response.json(
        { error: "Invalid device type. Must be 'Mobile' or 'Desktop'" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create popup view record
    await prisma.popupView.create({
      data: {
        shop,
        sessionId,
        device,
      },
    });

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error tracking popup view:", error);
    return Response.json(
      { error: "Failed to track popup view" },
      { status: 500, headers: corsHeaders }
    );
  }
};


