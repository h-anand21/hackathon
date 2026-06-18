import { NextRequest, NextResponse } from 'next/server';
import { prisma, resolveUserId } from '@/lib/db';
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
    const rawUserId = searchParams.get('userId');

    if (!rawUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const userId = await resolveUserId(rawUserId);

    // 1. Fetch custom local events from database
    const dbLocalEvents = await prisma.localEvent.findMany({
      where: { userId }
    });

    let localEvents = dbLocalEvents.map((e: any) => ({
      id: e.id,
      userId: e.userId,
      title: e.title,
      description: e.description || '',
      start: e.start,
      end: e.end,
      location: e.location || '',
    }));

    // Seeding logic removed so that empty state is clean and no dummy events are shown.

    let accounts = await prisma.corsairAccount.findMany({
      where: {
        tenantId: userId,
        integration: {
          name: 'googlecalendar',
        },
      },
    });

    if (accounts.length === 0) {
      accounts = await prisma.corsairAccount.findMany({
        where: {
          integration: {
            name: 'googlecalendar',
          },
        },
        take: 1
      });
    }

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
    const { userId: rawUserId, title, description, start, end, location } = await request.json();

    if (!rawUserId || !title || !start || !end) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    const userId = await resolveUserId(rawUserId);

    // Write to PostgreSQL database
    const newEvent = await prisma.localEvent.create({
      data: {
        userId,
        title,
        description: description || '',
        start,
        end,
        location: location || '',
      }
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error('Error creating local calendar event:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const rawUserId = searchParams.get('userId');

    if (!eventId || !rawUserId) {
      return NextResponse.json({ error: 'Missing eventId or userId' }, { status: 400 });
    }

    const userId = await resolveUserId(rawUserId);

    // Attempt to find and delete the event in localEvent first
    const localEvent = await prisma.localEvent.findFirst({
      where: { id: eventId, userId }
    });

    if (localEvent) {
      await prisma.localEvent.delete({
        where: { id: eventId }
      });
      return NextResponse.json({ success: true, message: 'Event deleted successfully' });
    }

    // If it's a CorsairEntity event (cached google event)
    const googleEvent = await prisma.corsairEntity.findFirst({
      where: {
        id: eventId,
        account: {
          tenantId: userId
        }
      }
    });

    if (googleEvent) {
      await prisma.corsairEntity.delete({
        where: { id: eventId }
      });
      return NextResponse.json({ success: true, message: 'Google calendar event removed from cache' });
    }

    return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
