import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    const accounts = await prisma.corsairAccount.findMany({
      include: {
        integration: true,
      },
    });

    const entitiesCount = await prisma.corsairEntity.count({
      where: { entityType: 'messages' },
    });

    const priorityEmailsCount = await prisma.priorityEmail.count();
    const priorityEmails = await prisma.priorityEmail.findMany({
      take: 10,
      orderBy: { receivedAt: 'desc' },
    });

    const embeddingsCount = await prisma.emailEmbedding.count();
    const embeddings = await prisma.emailEmbedding.findMany({
      take: 5,
      select: {
        id: true,
        entityId: true,
        content: true,
      },
    });

    return NextResponse.json({
      success: true,
      diagnostics: {
        users: users.map((u) => ({ id: u.id, email: u.email, name: u.name })),
        accounts: accounts.map((a) => ({
          id: a.id,
          tenantId: a.tenantId,
          integrationName: a.integration.name,
        })),
        gmailMessageEntitiesCount: entitiesCount,
        priorityEmailsCount,
        priorityEmailsSample: priorityEmails.map((e) => ({
          id: e.id,
          entityId: e.entityId,
          subject: e.subject,
          sender: e.sender,
          priority: e.priority,
          category: e.category,
          receivedAt: e.receivedAt,
        })),
        embeddingsCount,
        embeddingsSample: embeddings,
      },
    });
  } catch (error: any) {
    console.error('Diagnostics failed:', error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
