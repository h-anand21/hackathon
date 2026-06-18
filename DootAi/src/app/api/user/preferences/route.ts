import { NextRequest, NextResponse } from 'next/server';
import { prisma, resolveUserId } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUserId = searchParams.get("userId");

    if (!rawUserId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const userId = await resolveUserId(rawUserId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    return NextResponse.json({ success: true, preferences: user?.preferences || {} });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: rawUserId, preferences } = await request.json();

    if (!rawUserId || !preferences) {
      return NextResponse.json(
        { error: 'Missing userId or preferences' },
        { status: 400 }
      );
    }

    const userId = await resolveUserId(rawUserId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
