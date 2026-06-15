import { PrismaClient } from '@prisma/client';

const localUrl = process.env.LOCAL_DATABASE_URL || "postgresql://postgres:password@localhost:5432/dootai?schema=public";
const neonUrl = process.env.NEON_DATABASE_URL;

if (!neonUrl) {
  console.error("Error: NEON_DATABASE_URL is not set in your environment or .env file!");
  process.exit(1);
}

const prismaLocal = new PrismaClient({
  datasources: { db: { url: localUrl } },
});

const prismaNeon = new PrismaClient({
  datasources: { db: { url: neonUrl } },
});

async function main() {
  console.log('--- STARTING DATA MIGRATION FROM LOCAL DB TO NEON DB ---');

  // 1. Migrate Users
  console.log('Migrating Users...');
  const users = await prismaLocal.user.findMany();
  for (const user of users) {
    await prismaNeon.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log(`Migrated ${users.length} Users.`);

  // 2. Migrate CorsairIntegrations
  console.log('Migrating Corsair Integrations...');
  const integrations = await prismaLocal.corsairIntegration.findMany();
  for (const integration of integrations) {
    await prismaNeon.corsairIntegration.upsert({
      where: { id: integration.id },
      update: integration,
      create: integration,
    });
  }
  console.log(`Migrated ${integrations.length} Corsair Integrations.`);

  // 3. Migrate CorsairAccounts
  console.log('Migrating Corsair Accounts...');
  const accounts = await prismaLocal.corsairAccount.findMany();
  for (const account of accounts) {
    await prismaNeon.corsairAccount.upsert({
      where: { id: account.id },
      update: account,
      create: account,
    });
  }
  console.log(`Migrated ${accounts.length} Corsair Accounts.`);

  // 4. Migrate CorsairEntities
  console.log('Migrating Corsair Entities...');
  const entities = await prismaLocal.corsairEntity.findMany();
  for (const entity of entities) {
    await prismaNeon.corsairEntity.upsert({
      where: { id: entity.id },
      update: entity,
      create: entity,
    });
  }
  console.log(`Migrated ${entities.length} Corsair Entities.`);

  // 5. Migrate CorsairEvents
  console.log('Migrating Corsair Events...');
  const events = await prismaLocal.corsairEvent.findMany();
  for (const event of events) {
    await prismaNeon.corsairEvent.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    });
  }
  console.log(`Migrated ${events.length} Corsair Events.`);

  // 6. Migrate PriorityEmails
  console.log('Migrating Priority Emails...');
  const emails = await prismaLocal.priorityEmail.findMany();
  for (const email of emails) {
    await prismaNeon.priorityEmail.upsert({
      where: { id: email.id },
      update: email,
      create: email,
    });
  }
  console.log(`Migrated ${emails.length} Priority Emails.`);

  // 7. Migrate Tasks
  console.log('Migrating Tasks...');
  const tasks = await prismaLocal.task.findMany();
  for (const task of tasks) {
    await prismaNeon.task.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    });
  }
  console.log(`Migrated ${tasks.length} Tasks.`);

  // 8. Migrate ChatSessions
  console.log('Migrating Chat Sessions...');
  const chatSessions = await prismaLocal.chatSession.findMany();
  for (const session of chatSessions) {
    await prismaNeon.chatSession.upsert({
      where: { id: session.id },
      update: session,
      create: session,
    });
  }
  console.log(`Migrated ${chatSessions.length} Chat Sessions.`);

  // 9. Migrate ChatMessages
  console.log('Migrating Chat Messages...');
  const chatMessages = await prismaLocal.chatMessage.findMany();
  for (const msg of chatMessages) {
    await prismaNeon.chatMessage.upsert({
      where: { id: msg.id },
      update: msg,
      create: msg,
    });
  }
  console.log(`Migrated ${chatMessages.length} Chat Messages.`);

  console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prismaLocal.$disconnect();
    await prismaNeon.$disconnect();
  });
