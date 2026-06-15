import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Find the Google Calendar accounts for this user
    const accounts = await prisma.corsairAccount.findMany({
      where: {
        tenantId: userId,
        integrationId: 'googlecalendar',
      },
    });

    let events: any[] = [];

    if (accounts.length > 0) {
      const accountIds = accounts.map((acc) => acc.id);

      // Fetch the cached event entities from CorsairEntity
      const entities = await prisma.corsairEntity.findMany({
        where: {
          accountId: { in: accountIds },
          entityType: 'events',
        },
      });

      events = entities.map((entity: any) => {
        const data = entity.data || {};
        return {
          id: entity.id,
          title: data.summary || 'Untitled Event',
          description: data.description || '',
          start: data.start?.dateTime || data.start?.date || entity.createdAt,
          end: data.end?.dateTime || data.end?.date || entity.createdAt,
          location: data.location || '',
        };
      });
    }

    // Fallback mock events for premium presentation
    if (events.length === 0) {
      const today = new Date();
      
      const event1Start = new Date(today);
      event1Start.setHours(9, 0, 0, 0);
      const event1End = new Date(today);
      event1End.setHours(10, 0, 0, 0);

      const event2Start = new Date(today);
      event2Start.setDate(today.getDate() + 1); // Tomorrow
      event2Start.setHours(14, 0, 0, 0);
      const event2End = new Date(today);
      event2End.setDate(today.getDate() + 1);
      event2End.setHours(15, 30, 0, 0);

      const event3Start = new Date(today);
      event3Start.setDate(today.getDate() - 1); // Yesterday
      event3Start.setHours(11, 0, 0, 0);
      const event3End = new Date(today);
      event3End.setDate(today.getDate() - 1);
      event3End.setHours(12, 0, 0, 0);

      events = [
        {
          id: 'mock-ev-1',
          title: '🌸 Japanese Sketchbook Review',
          description: 'Finalize border radius and sketch shadow designs',
          start: event1Start.toISOString(),
          end: event1End.toISOString(),
          location: 'Conference Room 3A / Google Meet',
        },
        {
          id: 'mock-ev-2',
          title: '🍱 Bento Lunch & Hackathon Party',
          description: 'Catered Kyoto-style lunch boxes arriving',
          start: event2Start.toISOString(),
          end: event2End.toISOString(),
          location: 'DootAI Main Lounge',
        },
        {
          id: 'mock-ev-3',
          title: '⚡ Setup pgvector Database Container',
          description: 'Initialize vector database extension for semantic index queries',
          start: event3Start.toISOString(),
          end: event3End.toISOString(),
          location: 'Dev Standup Desk',
        }
      ];
    }

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
