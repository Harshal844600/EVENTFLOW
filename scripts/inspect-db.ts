import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  const events = await prisma.event.findMany({ select: { id: true, title: true, price: true, capacity: true, seatsBooked: true, status: true } });
  const bookingsCount = await prisma.booking.count();

  console.log("Current users:", JSON.stringify(users, null, 2));
  console.log("Current events:", JSON.stringify(events, null, 2));
  console.log("Current bookings count:", bookingsCount);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
