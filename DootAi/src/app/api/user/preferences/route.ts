import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing userId or preferences' },
        { status: 400 }
      );
    }

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
