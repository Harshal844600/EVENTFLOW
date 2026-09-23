import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType required" }, { status: 400 });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME || "mock-bucket";
    const extension = filename.split(".").pop();
    const key = `events/banners/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Construct the final public URL that will be stored in the DB
    const finalUrl = `https://${bucket}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    return NextResponse.json({ presignedUrl, finalUrl });
  } catch (error) {
    console.error("POST /api/upload/presigned-url error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
