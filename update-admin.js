require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.upsert({
    where: { email: 'harshalvidhate27@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'harshalvidhate27@gmail.com',
      name: 'Harshal Vidhate',
      role: 'ADMIN'
    }
  });
  console.log('Successfully updated Neon database!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
