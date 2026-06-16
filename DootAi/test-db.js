const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function main() {
  console.log('--- DB DIAGNOSTICS ---');
  
  const users = await prisma.user.findMany();
  console.log('Users in database:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));

  const accounts = await prisma.corsairAccount.findMany({
    include: { integration: true }
  });
  console.log('Accounts in database:', accounts.map(a => ({ id: a.id, tenantId: a.tenantId, integration: a.integration.name })));

  const entitiesCount = await prisma.corsairEntity.count({
    where: { entityType: 'messages' }
  });
  console.log('Total Gmail message entities cached in DB:', entitiesCount);

  const priorityEmails = await prisma.priorityEmail.findMany();
  console.log('Total Priority Emails classified in DB:', priorityEmails.length);
  console.log('Sample priority emails:', priorityEmails.map(e => ({
    id: e.id,
    subject: e.subject,
    priority: e.priority,
    category: e.category,
    summary: e.summary ? e.summary.substring(0, 60) + '...' : null
  })));

  const embeddingsCount = await prisma.emailEmbedding.count();
  console.log('Total Embeddings saved in DB:', embeddingsCount);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
