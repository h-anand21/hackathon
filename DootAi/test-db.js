import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INSPECTING DATABASE ACCOUNTS ---');
  const accounts = await prisma.corsairAccount.findMany({
    include: {
      integration: true,
    }
  });
  console.log('Total accounts found:', accounts.length);
  console.log(JSON.stringify(accounts, null, 2));

  console.log('--- INSPECTING DATABASE ENTITIES ---');
  const entitiesCount = await prisma.corsairEntity.count();
  console.log('Total cached entities count:', entitiesCount);

  const entities = await prisma.corsairEntity.findMany({
    take: 5
  });
  console.log('Sample entities:', JSON.stringify(entities, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
