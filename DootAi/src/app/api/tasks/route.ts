import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, priority } = await request.json();

    if (!userId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        priority: priority || 'Medium',
        completed: false,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { taskId, completed, title, priority } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: completed !== undefined ? completed : undefined,
        title: title || undefined,
        priority: priority || undefined,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
