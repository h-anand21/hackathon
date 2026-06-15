import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { corsair, ensureCorsairConfigured } from '@/lib/corsair';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const logs: string[] = [];
    logs.push('--- DOOTAI SYNC DIAGNOSTICS ---');

    // 1. Get all users
    const users = await prisma.user.findMany();
    logs.push(`Found ${users.length} user(s) in database:`);
    users.forEach(u => logs.push(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name}`));

    if (users.length === 0) {
      logs.push('No users found in database. Please log in first.');
      return NextResponse.json({ success: false, logs });
    }

    // 2. Ensure Corsair is configured
    logs.push('Configuring Corsair...');
    await ensureCorsairConfigured();
    logs.push('Corsair configured.');

    // 3. Get all connected accounts
    const accounts = await prisma.corsairAccount.findMany({
      include: {
        integration: true
      }
    });
    logs.push(`Found ${accounts.length} Corsair account(s) in database:`);
    accounts.forEach(a => {
      logs.push(`- ID: ${a.id} | Tenant ID: ${a.tenantId} | Integration: ${a.integration.name}`);
    });

    // 4. Get all CorsairEntity records in database
    const entities = await prisma.corsairEntity.findMany();
    logs.push(`\nFound ${entities.length} CorsairEntity records in database:`);
    entities.forEach((e, idx) => {
      const data = (e.data as any) || {};
      logs.push(`${idx + 1}. EntityId: ${e.entityId} | AccountId: ${e.accountId} | Type: ${e.entityType} | Subject: "${data.subject || 'None'}" | From: "${data.from || 'None'}"`);
    });

    // 5. Get all PriorityEmail records in database
    const priorityEmails = await prisma.priorityEmail.findMany();
    logs.push(`\nFound ${priorityEmails.length} PriorityEmail records in database:`);
    priorityEmails.forEach((p, idx) => {
      logs.push(`${idx + 1}. EntityId: ${p.entityId} | Subject: "${p.subject}" | Sender: "${p.sender}" | Priority: ${p.priority}`);
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
