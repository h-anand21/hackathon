import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getGeminiEmbedding } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');

    if (!userId || !query) {
      return NextResponse.json(
        { error: 'Missing userId or query parameter' },
        { status: 400 }
      );
    }

    console.log(`[Search] Performing semantic search for user ${userId} with query: "${query}"`);

    // Generate query embedding
    const embedding = await getGeminiEmbedding(query);
    const embeddingString = `[${embedding.join(',')}]`;

    // Query DB using pgvector cosine distance
    const results: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        e."entity_id" as "entityId", 
        e."content", 
        p."id",
        p."subject", 
        p."sender", 
        p."snippet", 
        p."priority", 
        p."category", 
        p."summary",
        p."received_at" as "receivedAt",
        1 - (e."embedding" <=> $1::vector) as "similarity"
      FROM "EmailEmbedding" e
      INNER JOIN "PriorityEmail" p ON e."entity_id" = p."entity_id"
      WHERE p."user_id" = $2
      ORDER BY e."embedding" <=> $1::vector
      LIMIT 5
    `, embeddingString, userId);

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('[Search] Error during semantic search:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
