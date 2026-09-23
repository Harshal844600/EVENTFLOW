import { PrismaClient, EventStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const events: Array<any> = [
    {
      title: "Global Tech Summit 2026",
      description: "Join the brightest minds in technology for a three-day summit exploring the future of AI, quantum computing, and serverless architectures. Expect keynote speeches from industry leaders, hands-on workshops, and unparalleled networking opportunities. Whether you're a seasoned developer or a tech enthusiast, this is the event of the year.",
      category: "Technology",
      venue: "Moscone Center, San Francisco",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 33), // 33 days from now
      price: 299.99,
      capacity: 5000,
      status: "PUBLISHED",
      bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000",
      aiGeneratedDescription: true,
    },
    {
      title: "Electronic Music Festival",
      description: "Experience the ultimate audio-visual spectacle at the Electronic Music Festival. Dance under the stars to the beats of world-renowned DJs. This overnight event features multiple stages, immersive light shows, and food trucks from the city's top culinary artists.",
      category: "Music",
      venue: "Desert Valley Arena, Nevada",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now
      price: 150.00,
      capacity: 10000,
      status: "PUBLISHED",
      bannerUrl: "https://images.unsplash.com/photo-1470229722913-7c090be5c5a8?auto=format&fit=crop&q=80&w=2000",
      aiGeneratedDescription: false,
    },
    {
      title: "Startup Founders Networking",
      description: "An exclusive evening for startup founders, angel investors, and venture capitalists. Pitch your ideas, find co-founders, and secure your seed round. Drinks and hors d'oeuvres will be served.",
      category: "Business",
      venue: "The Grand Hotel, New York",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 4), // 4 hours later
      price: 50.00,
      capacity: 200,
      status: "PUBLISHED",
      bannerUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=2000",
      aiGeneratedDescription: false,
    },
    {
      title: "Web3 Developer Bootcamp",
      description: "A draft event for planning the upcoming Web3 and blockchain developer bootcamp.",
      category: "Education",
      venue: "Online",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), 
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 62),
      price: 0.00,
      capacity: 1000,
      status: "DRAFT",
      bannerUrl: "",
      aiGeneratedDescription: false,
    }
  ];

  console.log("Fetching admin user...");
  const admin = await prisma.user.findUnique({
    where: { email: "admin@eventflow.com" }
  });

  if (!admin) {
    console.error("Admin user not found. Run npm run seed first.");
    process.exit(1);
  }

  console.log("Seeding events...");
  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        createdById: admin.id,
      }
    });
  }
  console.log("Events seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
