import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

export const action = async ({ request }: ActionFunctionArgs) => {
  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authResult = await authenticate.admin(request);
    if (!authResult || !authResult.session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "File must be an image" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return Response.json(
        { error: "File size must be less than 5MB" },
        { status: 400, headers: corsHeaders }
      );
    }

    // If S3 is configured, upload to S3
    if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop() || "png";
      const key = `logos/${timestamp}-${randomString}.${extension}`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      });

      await s3Client.send(command);

      // Construct public URL
      const region = process.env.AWS_REGION || "us-east-1";
      const url = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;

      return Response.json({ url }, { headers: corsHeaders });
    } else {
      // Fallback: return a data URL (not recommended for production)
      // This is a temporary solution if S3 is not configured
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      return Response.json({ url: dataUrl }, { headers: corsHeaders });
    }
  } catch (error) {
    console.error("Error uploading logo:", error);
    return Response.json(
      { error: "Failed to upload logo" },
      { status: 500, headers: corsHeaders }
    );
  }
};


