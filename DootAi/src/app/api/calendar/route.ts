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

    // If no local events exist for this user, seed default events relative to current week
    if (localEvents.length === 0) {
      const today = new Date();
      const currentDayOfWeek = today.getDay();
      const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
      
      const monday = new Date(today);
      monday.setDate(today.getDate() + daysToMonday);

      const wednesday = new Date(monday);
      wednesday.setDate(monday.getDate() + 2);

      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);

      const formatISO = (d: Date, timeStr: string) => {
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${yr}-${mo}-${da}T${timeStr}`;
      };

      const seedEvents = [
        {
          userId,
          title: '🌸 Team Standup',
          description: 'Daily team sync to review sketchbook layout features',
          start: formatISO(monday, '10:00:00'),
          end: formatISO(monday, '10:30:00'),
          location: 'Google Meet',
        },
        {
          userId,
          title: '📞 Client Call',
          description: 'Sync with stakeholders on integrations feedback',
          start: formatISO(monday, '12:00:00'),
          end: formatISO(monday, '13:00:00'),
          location: 'Zoom',
        },
        {
          userId,
          title: '🌸 Design Review',
          description: 'Review Ghibli vector layout options',
          start: formatISO(monday, '15:00:00'),
          end: formatISO(monday, '16:00:00'),
          location: 'Conference Room 3A',
        },
        {
          userId,
          title: '🌸 Project Demo',
          description: 'Demo Ghibli flow to Aarav Patel',
          start: formatISO(wednesday, '09:00:00'),
          end: formatISO(wednesday, '10:30:00'),
          location: 'DootAI Lounge',
        },
        {
          userId,
          title: '🍱 Bento Lunch & Hackathon Party',
          description: 'Catered Kyoto-style lunch boxes arriving',
          start: formatISO(friday, '12:00:00'),
          end: formatISO(friday, '13:30:00'),
          location: 'DootAI Main Lounge',
        }
      ];

      // Bulk insert seeds
      await prisma.localEvent.createMany({
        data: seedEvents
      });

      // Fetch newly seeded events
      const newlySeeded = await prisma.localEvent.findMany({
        where: { userId }
      });

      localEvents = newlySeeded.map((e: any) => ({
        id: e.id,
        userId: e.userId,
        title: e.title,
        description: e.description || '',
        start: e.start,
        end: e.end,
        location: e.location || '',
      }));
    }

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
