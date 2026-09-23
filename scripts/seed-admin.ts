import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@eventflow.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  console.log(`Checking if admin user ${adminEmail} exists...`);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user already exists. Exiting...");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created successfully: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
