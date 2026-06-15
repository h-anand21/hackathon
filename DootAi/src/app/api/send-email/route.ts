import { NextRequest, NextResponse } from 'next/server';
import { corsair } from '@/lib/corsair';

export async function POST(request: NextRequest) {
  try {
    const { userId, to, subject, body } = await request.json();

    if (!userId || !to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
