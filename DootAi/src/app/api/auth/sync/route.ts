import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { uid, email, name, photoUrl } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: uid and email' },
        { status: 400 }
      );
    }

    // Upsert the user in our PostgreSQL database using Firebase credentials
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        name,
        photoUrl,
      },
      create: {
        id: uid,
        email,
        name,
        photoUrl,
        preferences: {},
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
