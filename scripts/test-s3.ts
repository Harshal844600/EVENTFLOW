import "dotenv/config";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function test() {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const testKey = "test-connectivity.txt";
  console.log(`Testing S3 with bucket "${bucket}" in region "${process.env.AWS_REGION}"...`);

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: "EventFlow S3 Test",
        ContentType: "text/plain",
      })
    );
    console.log(" PutObject succeeded! S3 upload is fully functional.");

    // Clean up test file
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: testKey,
      })
    );
    console.log(" Cleanup succeeded. Bucket permissions are confirmed!");
  } catch (err: any) {
    console.error(" S3 Test Failed:");
    console.error("Error Name:", err.name);
    console.error("Message:", err.message);
    if (err.$metadata) {
      console.error("HTTP Status Code:", err.$metadata.httpStatusCode);
    }
  }
}

test();
