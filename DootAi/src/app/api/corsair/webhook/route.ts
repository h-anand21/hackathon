import { NextRequest, NextResponse } from 'next/server';
import { corsair, ensureCorsairConfigured } from '@/lib/corsair';
import { processWebhook } from 'corsair';
import { prisma } from '@/lib/db';
import { classifyAndSummarizeEmail, getGeminiEmbedding, saveEmailEmbedding } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    await ensureCorsairConfigured();

    // Reconstruct headers for Corsair
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await request.json();

    console.log('[Webhook] Received webhook from Corsair:', JSON.stringify(body, null, 2));

    let result: any;
    if (body.isMock) {
      // Find the user to link as tenant
      const user = await prisma.user.findFirst({
        where: { email: body.emailAddress },
      });
      const tenantId = user ? user.id : 'mock-tenant-id';

      // Find or create mock Gmail integration
      let gmailIntegration = await prisma.corsairIntegration.findFirst({
        where: { name: 'gmail' },
      });
      if (!gmailIntegration) {
        gmailIntegration = await prisma.corsairIntegration.create({
          data: {
            id: 'gmail',
            name: 'gmail',
            config: {},
          }
        });
      }

      // Upsert CorsairAccount first to avoid foreign key constraint violations
      const accountId = body.accountId || 'mock-account-id';
      await prisma.corsairAccount.upsert({
        where: { id: accountId },
        update: {
          tenantId,
          integrationId: gmailIntegration.id,
        },
        create: {
          id: accountId,
          tenantId,
          integrationId: gmailIntegration.id,
          config: {},
        }
      });

      // For testing: Create/update a mock CorsairEntity so the rest of the pipeline works seamlessly
      await prisma.corsairEntity.upsert({
        where: { id: body.entityId },
        update: {
          data: {
            subject: body.subject,
            from: body.sender,
            body: body.body,
            snippet: body.snippet,
            createdAt: new Date().toISOString(),
          }
        },
        create: {
          id: body.entityId,
          accountId,
          entityId: body.entityId,
          entityType: 'messages',
          version: '1',
          data: {
            subject: body.subject,
            from: body.sender,
            body: body.body,
            snippet: body.snippet,
            createdAt: new Date().toISOString(),
          }
        }
      });

      result = {
        success: true,
        corsairEntityId: body.entityId,
        data: {
          type: 'messageReceived',
          emailAddress: body.emailAddress
        }
      };
    } else {
      // Process the webhook through Corsair
      result = await processWebhook(corsair, headers, body);
    }

    if (result.success && result.data && result.data.type === 'messageReceived') {
      const emailAddress = result.data.emailAddress;
      const entityId = result.corsairEntityId;

      console.log(`[Webhook] New email received for ${emailAddress}, entity ID: ${entityId}`);

      // Find the user associated with the email address
      const user = await prisma.user.findFirst({
        where: { email: emailAddress },
      });

      if (user && entityId) {
        // Query the newly cached CorsairEntity to get its detailed fields
        const entity = await prisma.corsairEntity.findUnique({
          where: { id: entityId },
        });

        if (entity) {
          const data = (entity.data as unknown as Record<string, string | undefined>) || {};
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
              userId: user.id,
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

          console.log(`[Webhook] Email classified and embedded for user ${user.id}`);
        }
      }
    }

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error('[Webhook] Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
