import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
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
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const rawExt = file.name.split(".").pop() || "jpg";
    const extension = rawExt.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const filename = `${uuidv4()}.${extension}`;
    const key = `events/banners/${filename}`;

    const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;

    // 1. Try AWS S3 upload first if credentials are configured
    if (bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        const region = process.env.AWS_REGION || "eu-north-1";
        const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        logger.info("Uploaded banner successfully to AWS S3", { s3Url });

        return NextResponse.json({ url: s3Url, storage: "s3" });
      } catch (s3Error: any) {
        logger.warn("AWS S3 direct upload failed, falling back to local storage", {
          error: s3Error.message,
        });
      }
    }

    // 2. Local public storage fallback (guarantees upload always works even without AWS S3)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFilePath = path.join(uploadDir, filename);
    fs.writeFileSync(localFilePath, buffer);

    const localUrl = `/uploads/banners/${filename}`;
    logger.info("Saved banner to local uploads directory", { localUrl });

    return NextResponse.json({ url: localUrl, storage: "local" });
  } catch (error) {
    logger.error("POST /api/upload error", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
