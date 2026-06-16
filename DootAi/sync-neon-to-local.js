const { PrismaClient } = require('@prisma/client');

const localUrl = process.env.LOCAL_DATABASE_URL || "postgresql://postgres:password@localhost:5432/dootai?schema=public";
const neonUrl = process.env.NEON_DATABASE_URL || "postgresql://neondb_owner:npg_QUGMwmlFP8q1@ep-nameless-cloud-ao2mjayg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prismaLocal = new PrismaClient({
  datasources: { db: { url: localUrl } },
});

const prismaNeon = new PrismaClient({
  datasources: { db: { url: neonUrl } },
});

async function main() {
  console.log('--- STARTING SYNC FROM NEON CLOUD DB TO LOCAL DB ---');

  // 1. Sync Corsair Integrations
  console.log('Syncing Corsair Integrations...');
  const integrations = await prismaNeon.corsairIntegration.findMany();
  for (const integration of integrations) {
    await prismaLocal.corsairIntegration.upsert({
      where: { id: integration.id },
      update: integration,
      create: integration,
    });
  }
  console.log(`Synced ${integrations.length} Corsair Integrations.`);

  // 2. Sync Corsair Accounts
  console.log('Syncing Corsair Accounts...');
  const accounts = await prismaNeon.corsairAccount.findMany();
  for (const account of accounts) {
    await prismaLocal.corsairAccount.upsert({
      where: { id: account.id },
      update: account,
      create: account,
    });
  }
  console.log(`Synced ${accounts.length} Corsair Accounts.`);

  // 3. Sync Corsair Entities
  console.log('Syncing Corsair Entities...');
  const entities = await prismaNeon.corsairEntity.findMany();
  for (const entity of entities) {
    await prismaLocal.corsairEntity.upsert({
      where: { id: entity.id },
      update: entity,
      create: entity,
    });
  }
  console.log(`Synced ${entities.length} Corsair Entities.`);

  // 4. Sync Priority Emails
  console.log('Syncing Priority Emails...');
  const emails = await prismaNeon.priorityEmail.findMany();
  for (const email of emails) {
    await prismaLocal.priorityEmail.upsert({
      where: { id: email.id },
      update: email,
      create: email,
    });
  }
  console.log(`Synced ${emails.length} Priority Emails.`);

  // 5. Sync Email Embeddings
  console.log('Syncing Email Embeddings...');
  const embeddings = await prismaNeon.emailEmbedding.findMany();
  for (const emb of embeddings) {
    // We upsert using raw query for PG vector if it has Unsupported type,
    // but Prisma Client can upsert if the model definition allows it or if we use raw SQL.
    // Let's use raw SQL for safe embedding sync to local database
    const embeddingString = emb.embedding ? `[${emb.embedding.toString()}]` : null;
    if (embeddingString) {
      await prismaLocal.$executeRawUnsafe(
        `INSERT INTO "EmailEmbedding" ("id", "entity_id", "content", "embedding")
         VALUES ($1, $2, $3, cast($4 as vector))
         ON CONFLICT ("entity_id") DO UPDATE
         SET "content" = $3, "embedding" = cast($4 as vector)`,
        emb.id,
        emb.entityId,
        emb.content,
        embeddingString
      );
    } else {
      await prismaLocal.emailEmbedding.upsert({
        where: { entityId: emb.entityId },
        update: { content: emb.content },
        create: { id: emb.id, entityId: emb.entityId, content: emb.content },
      });
    }
  }
  console.log(`Synced ${embeddings.length} Email Embeddings.`);

  console.log('--- SYNC COMPLETED SUCCESSFULLY ---');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prismaLocal.$disconnect();
    await prismaNeon.$disconnect();
  });
