import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

    // If Railway Storage is configured, upload to Railway Storage
    if (process.env.RAILWAY_STORAGE_BUCKET_NAME && process.env.RAILWAY_STORAGE_ACCESS_KEY) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop() || "png";
      const key = `logos/${timestamp}-${randomString}.${extension}`;

      // Initialize S3 client with Railway Storage configuration
      const region = process.env.RAILWAY_STORAGE_REGION || "auto";
      const endpoint = process.env.RAILWAY_STORAGE_ENDPOINT || "https://storage.railway.app";
      
      const s3Client = new S3Client({
        region: "us-east-1", // Railway Storage doesn't use AWS regions, but SDK requires one
        endpoint: endpoint,
        forcePathStyle: true, // Railway Storage uses path-style URLs
        credentials: {
          accessKeyId: process.env.RAILWAY_STORAGE_ACCESS_KEY,
          secretAccessKey: process.env.RAILWAY_STORAGE_SECRET_KEY || "",
        },
      });

      // Upload to Railway Storage
      const command = new PutObjectCommand({
        Bucket: process.env.RAILWAY_STORAGE_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      });

      await s3Client.send(command);

      // Construct Railway Storage URL (path-style)
      const url = `${endpoint}/${process.env.RAILWAY_STORAGE_BUCKET_NAME}/${key}`;

      return Response.json({ url }, { headers: corsHeaders });
    } else {
      // Fallback: return a data URL (not recommended for production)
      // This is a temporary solution if Railway Storage is not configured
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
