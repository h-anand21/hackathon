import { NextRequest, NextResponse } from 'next/server';
import { corsair } from '@/lib/corsair';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, to, subject, body, isDraft } = await request.json();

    if (!userId || !to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isDraft) {
      // Find the Gmail accounts for this user to bind the draft to
      const gmailAccount = await prisma.corsairAccount.findFirst({
        where: {
          tenantId: userId,
          integration: {
            name: 'gmail',
          },
        },
      });

      const accountId = gmailAccount?.id || 'mock-account-id';
      const entityId = `draft-${Date.now()}`;

      // Save draft email into CorsairEntity and PriorityEmail so it displays in the "Drafts" tab
      const corsairEntity = await prisma.corsairEntity.create({
        data: {
          id: `draft-entity-${Date.now()}`,
          accountId,
          entityId,
          entityType: 'messages',
          version: '1',
          data: {
            subject,
            from: gmailAccount?.config ? (gmailAccount.config as any).emailAddress || 'you@doot.ai' : 'you@doot.ai',
            to,
            snippet: body.substring(0, 100),
            body,
            createdAt: new Date().toISOString(),
            category: 'Drafts'
          }
        }
      });

      const gmailConfig = (gmailAccount?.config || {}) as any;

      await prisma.priorityEmail.create({
        data: {
          userId,
          entityId: corsairEntity.id,
          subject,
          sender: gmailConfig.emailAddress || 'you@doot.ai',
          snippet: body.substring(0, 100),
          priority: 'LOW',
          category: 'Drafts',
          summary: `Draft email to: ${to}`,
          receivedAt: new Date()
        }
      });

      return NextResponse.json({ success: true, isDraft: true });
    }

    // Build the raw MIME message as base64url encoded string
    const mimeMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body,
    ].join('\r\n');

    const raw = Buffer.from(mimeMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Get the tenant instance to check if it exists
    const tenantMeta = await corsair.manage.tenants.get(userId).catch(() => null);
    if (!tenantMeta) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get the plugin-enabled tenant client
    const tenant = corsair.withTenant(userId);

    // Send the message using Gmail plugin API
    await tenant.gmail.api.messages.send({
      userId: 'me',
      raw,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
