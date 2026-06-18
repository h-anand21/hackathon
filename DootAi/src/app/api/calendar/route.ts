import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const eventsFilePath = path.join(process.cwd(), "src/lib/data/events.json");

function readLocalEvents() {
  try {
    if (!fs.existsSync(eventsFilePath)) {
      return [];
    }
    const content = fs.readFileSync(eventsFilePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (e) {
    console.error("Error reading local events:", e);
    return [];
  }
}

function writeLocalEvents(events: any[]) {
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error("Error writing local events:", e);
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Read custom local events
    const localEvents = readLocalEvents().filter((ev: any) => ev.userId === userId);

    // Find the Google Calendar accounts for this user
    const accounts = await prisma.corsairAccount.findMany({
      where: {
        tenantId: userId,
        integration: {
          name: 'googlecalendar',
        },
      },
    });

    let googleEvents: any[] = [];

    if (accounts.length > 0) {
      const accountIds = accounts.map((acc) => acc.id);

      // Fetch the cached event entities from CorsairEntity
      const entities = await prisma.corsairEntity.findMany({
        where: {
          accountId: { in: accountIds },
          entityType: 'events',
        },
      });

      googleEvents = entities.map((entity: any) => {
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

    const mergedEvents = [...localEvents, ...googleEvents];

    // Fallback mock events if nothing exists
    if (mergedEvents.length === 0) {
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

      const defaultEvents = [
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
      return NextResponse.json({ success: true, events: defaultEvents });
    }

    return NextResponse.json({ success: true, events: mergedEvents });
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, description, start, end, location } = await request.json();

    if (!userId || !title || !start || !end) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    const localEvents = readLocalEvents();
    const newEvent = {
      id: `local-ev-${Date.now()}`,
      userId,
      title,
      description: description || '',
      start,
      end,
      location: location || '',
    };

    localEvents.push(newEvent);
    writeLocalEvents(localEvents);

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error('Error creating local calendar event:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
