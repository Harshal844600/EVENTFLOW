import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fetching admin user...");
  let admin = await prisma.user.findUnique({
    where: { email: "admin@eventflow.com" }
  });

  if (!admin) {
    console.log("Admin not found, creating...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@eventflow.com",
        passwordHash,
        role: "ADMIN",
      }
    });
  }

  console.log("Creating dummy users...");
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        name: `Dummy User ${i}`,
        email: `user${i}@example.com`,
        role: "USER",
      }
    });
    users.push(user);
  }

  console.log("Creating dummy events...");
  const events = [];
  for (let i = 1; i <= 3; i++) {
    const event = await prisma.event.create({
      data: {
        title: `Analytics Test Event ${i}`,
        description: "This is a dummy event to test analytics.",
        category: ["Technology", "Music", "Business"][i-1],
        venue: "Virtual",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * i),
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * i + 3600000),
        price: i * 50.00,
        capacity: 100 * i,
        status: "PUBLISHED",
        createdById: admin.id,
      }
    });
    events.push(event);
  }

  console.log("Creating dummy bookings...");
  for (const user of users) {
    for (const event of events) {
      // Randomly book
      if (Math.random() > 0.3) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalAmount = quantity * Number(event.price);
        
        const booking = await prisma.booking.create({
          data: {
            eventId: event.id,
            userId: user.id,
            quantity,
            totalAmount,
            status: "CONFIRMED",
          }
        });

        await prisma.event.update({
          where: { id: event.id },
          data: { seatsBooked: { increment: quantity } }
        });

        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            razorpayOrderId: `mock_order_${Math.floor(Math.random()*100000)}`,
            amount: totalAmount,
            status: "PAID",
          }
        });
      }
    }
  }

  console.log("Creating dummy admin logs...");
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: "CREATE_EVENT",
      targetType: "EVENT",
      targetId: events[0].id,
    }
  });

  console.log("Dummy data generation complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
