import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gpdownloader.com' },
    update: {},
    create: {
      email: 'admin@gpdownloader.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Created test user:', user.email);

  // Create artists
  const artists = await Promise.all([
    prisma.artist.upsert({
      where: { name: 'Metallica' },
      update: {},
      create: { name: 'Metallica' },
    }),
    prisma.artist.upsert({
      where: { name: 'Led Zeppelin' },
      update: {},
      create: { name: 'Led Zeppelin' },
    }),
    prisma.artist.upsert({
      where: { name: 'Pink Floyd' },
      update: {},
      create: { name: 'Pink Floyd' },
    }),
  ]);

  console.log('Created artists:', artists.length);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
