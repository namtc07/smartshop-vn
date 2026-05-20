const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');
  
  // Tạo User mẫu linh-beauty
  const user = await prisma.user.upsert({
    where: { email: 'linh.beauty@gmail.com' },
    update: {},
    create: {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Cố định ID cho việc test thuận tiện
      email: 'linh.beauty@gmail.com',
      bioPageSlug: 'linh-beauty'
    }
  });

  console.log('Seeded User:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
