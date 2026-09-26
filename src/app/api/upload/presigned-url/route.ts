import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection (Max 20 presigned uploads per min)
    const clientIp = getClientIp(req);
    const limitCheck = rateLimit(`upload:${clientIp}`, { limit: 20, windowMs: 60_000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many upload requests. Please slow down." },
        { status: 429 }
      );
    }

    // 2. Authorization
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType required" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(contentType.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted." },
        { status: 400 }
      );
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || "mock-bucket";
    const rawExtension = filename.split(".").pop() || "jpg";
    const extension = rawExtension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const key = `events/banners/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const region = process.env.AWS_REGION || "eu-north-1";
    const finalUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    logger.info("Presigned S3 URL generated", { key, adminId: dbUser.id });

    return NextResponse.json({ presignedUrl, finalUrl });
  } catch (error) {
    logger.error("POST /api/upload/presigned-url error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
