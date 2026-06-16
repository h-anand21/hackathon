import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Find the Gmail accounts for this user
    const accounts = await prisma.corsairAccount.findMany({
      where: {
        tenantId: userId,
        integration: {
          name: 'gmail',
        },
      },
    });

    let mergedEmails: any[] = [];

    if (accounts.length > 0) {
      const accountIds = accounts.map((acc) => acc.id);

      // Fetch the cached message entities
      const entities = await prisma.corsairEntity.findMany({
        where: {
          accountId: { in: accountIds },
          entityType: 'messages',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Map entity data to a standard format
      const emails = entities.map((entity: any) => {
        const data = entity.data || {};
        return {
          id: entity.id,
          entityId: entity.id,
          subject: data.subject || 'No Subject',
          sender: data.from || 'Unknown Sender',
          to: data.to || '',
          snippet: data.snippet || '',
          body: data.body || '',
          receivedAt: data.createdAt || entity.createdAt,
          priority: 'MEDIUM',
          category: 'Personal',
        };
      });

      // Cross-reference with our PriorityEmail table
      const priorityEmails = await prisma.priorityEmail.findMany({
        where: { userId },
      });

      const priorityMap = new Map(priorityEmails.map((e) => [e.entityId, e]));

      mergedEmails = emails.map((email) => {
        const priorityInfo = priorityMap.get(email.id);
        if (priorityInfo) {
          return {
            ...email,
            priority: priorityInfo.priority,
            category: priorityInfo.category,
            summary: priorityInfo.summary,
          };
        }
        return email;
      });
    }

    // Fallback mock emails for premium demonstration
    if (mergedEmails.length === 0) {
      const mockEmails = [
        {
          id: 'mock-1',
          entityId: 'mock-1',
          subject: '🌸 Urgent: Schedule review for Japanese Sketchbook Design System',
          sender: 'Aarav Patel <aarav@doot.ai>',
          to: 'you@doot.ai',
          snippet: 'Hi there, we need to finalize the paper border styles and the spiral ring physics for the web view. Can we meet this Friday morning at 9:00 AM?',
          body: 'Hi there,\n\nWe need to finalize the paper border styles and the spiral ring physics for the web view. Can we meet this Friday morning at 9:00 AM?\n\nThanks,\nAarav Patel\nProduct Lead, DootAI',
          receivedAt: new Date(Date.now() - 3600000).toISOString(),
          priority: 'HIGH',
          category: 'Urgent',
          summary: 'Aarav requests a meeting this Friday morning at 9:00 AM to review the Japanese Sketchbook Design System features, including paper styles and ring physics.',
        },
        {
          id: 'mock-2',
          entityId: 'mock-2',
          subject: '🍱 Bento Catering for the Hackathon Party',
          sender: 'Yuki Sato <yuki@tokyobento.com>',
          to: 'you@doot.ai',
          snippet: 'Hello! Confirming your order for 50 Kyoto-style lunch boxes. We will deliver them directly to your workspace on Saturday at 12 PM.',
          body: 'Hello!\n\nConfirming your order for 50 Kyoto-style lunch boxes. We will deliver them directly to your workspace on Saturday at 12 PM.\n\nPlease let us know if there are any dietary restrictions.\n\nBest,\nYuki Sato',
          receivedAt: new Date(Date.now() - 7200000).toISOString(),
          priority: 'MEDIUM',
          category: 'Important',
          summary: 'Yuki confirms the order of 50 Kyoto-style lunch boxes to be delivered on Saturday at 12:00 PM for the hackathon.',
        },
        {
          id: 'mock-3',
          entityId: 'mock-3',
          subject: '🔥 Newsletter: 10 design tips for handwritten interfaces',
          sender: 'Sketchy Weekly <news@sketchy.dev>',
          to: 'you@doot.ai',
          snippet: 'In this week\'s issue: how to make web cards look hand-drawn using SVG filters and custom border-radius properties. Check it out!',
          body: 'In this week\'s issue: how to make web cards look hand-drawn using SVG filters and custom border-radius properties. Check it out!',
          receivedAt: new Date(Date.now() - 86400000).toISOString(),
          priority: 'LOW',
          category: 'Promotional',
          summary: 'Weekly newsletter discussing 10 design tips for hand-drawn interfaces, highlighting SVG filters and border-radius properties.',
        }
      ];
      return NextResponse.json({ success: true, emails: mockEmails });
    }

    return NextResponse.json({ success: true, emails: mergedEmails });
  } catch (error: any) {
    console.error('Error fetching inbox emails:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
