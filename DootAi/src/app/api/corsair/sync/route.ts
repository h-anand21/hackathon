import { NextRequest, NextResponse } from 'next/server';
import { corsair, ensureCorsairConfigured } from '@/lib/corsair';
import { prisma } from '@/lib/db';
import { classifyAndSummarizeEmail, getGeminiEmbedding, saveEmailEmbedding } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Ensure Corsair integrations are configured and database encryption keys are set up
    await ensureCorsairConfigured();

    // Get the tenant client scoped for the user
    const tenant = corsair.withTenant(userId);

    let gmailSynced = false;
    let gmailCount = 0;
    let gmailError = null;
    let calendarSynced = false;
    let calendarCount = 0;
    let calendarError = null;

    // 1. Sync Gmail
    const gmailAccount = await prisma.corsairAccount.findFirst({
      where: {
        tenantId: userId,
        integration: {
          name: 'gmail',
        },
      },
    });

    if (gmailAccount) {
      try {
        // Fetch latest 15 messages (summaries)
        const messagesList = await tenant.gmail.api.messages.list({
          userId: 'me',
          maxResults: 15,
        });

        if (messagesList.messages && messagesList.messages.length > 0) {
          gmailCount = messagesList.messages.length;
          
          // Parallel fetch of details for each message to cache subject, snippet, body, etc.
          await Promise.all(
            messagesList.messages.map(async (msg: any) => {
              if (msg.id) {
                try {
                  await tenant.gmail.api.messages.get({
                    id: msg.id,
                    userId: 'me',
                  });

                  // Perform AI classification & embedding generation for the synced message
                  const entity = await prisma.corsairEntity.findUnique({
                    where: { id: msg.id },
                  });

                  if (entity) {
                    const data = (entity.data as any) || {};
                    const subject = data.subject || 'No Subject';
                    const sender = data.from || 'Unknown Sender';
                    const bodyText = data.body || '';
                    const snippetText = data.snippet || '';
                    const receivedAt = data.createdAt || entity.createdAt;

                    // Call Gemini AI for classification and summarization
                    const aiResult = await classifyAndSummarizeEmail(subject, sender, bodyText || snippetText);

                    // Save the classification to the PriorityEmail table
                    await prisma.priorityEmail.upsert({
                      where: { entityId: entity.id },
                      update: {
                        priority: aiResult.priority,
                        category: aiResult.category,
                        summary: aiResult.summary,
                      },
                      create: {
                        userId,
                        entityId: entity.id,
                        subject,
                        sender,
                        snippet: snippetText,
                        priority: aiResult.priority,
                        category: aiResult.category,
                        summary: aiResult.summary,
                        receivedAt: new Date(receivedAt),
                      },
                    });

                    // Generate and save embedding for semantic search
                    const embeddingText = `From: ${sender}\nSubject: ${subject}\n\n${bodyText || snippetText}`;
                    const embedding = await getGeminiEmbedding(embeddingText);
                    await saveEmailEmbedding(entity.id, embeddingText, embedding);
                  }
                } catch (getErr) {
                  console.error(`Failed to fetch/classify details for message ${msg.id}:`, getErr);
                }
              }
            })
          );
        }
        gmailSynced = true;
      } catch (err: any) {
        console.error('Error syncing Gmail in sync route:', err);
        gmailError = err.message || String(err);
      }
    }

    // 2. Sync Google Calendar
    const calendarAccount = await prisma.corsairAccount.findFirst({
      where: {
        tenantId: userId,
        integration: {
          name: 'googlecalendar',
        },
      },
    });

    if (calendarAccount) {
      try {
        const eventsList = await tenant.googlecalendar.api.events.getMany({
          calendarId: 'primary',
          maxResults: 20,
        });
        
        if (eventsList.items) {
          calendarCount = eventsList.items.length;
        }
        calendarSynced = true;
      } catch (err: any) {
        console.error('Error syncing Calendar in sync route:', err);
        calendarError = err.message || String(err);
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        gmail: {
          synced: gmailSynced,
          count: gmailCount,
          error: gmailError,
        },
        calendar: {
          synced: calendarSynced,
          count: calendarCount,
          error: calendarError,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in sync endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
