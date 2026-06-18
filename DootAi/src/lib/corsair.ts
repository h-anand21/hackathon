import { Pool } from 'pg';
import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { createCorsairOrm } from 'corsair/orm';
import { initializeIntegrationDEK } from 'corsair/core';

// Share the underlying PG Pool between Corsair and Prisma
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Avoid exhausting connections on Neon / local db
});

export const corsair = createCorsair({
  plugins: [
    gmail(),
    googlecalendar(),
  ],
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true, // Configured for multi-user Firebase setup
});

export async function ensureCorsairConfigured() {
  // 1. Ensure the plugin integrations are registered in the database
  const symbols = Object.getOwnPropertySymbols(corsair);
  const internalSymbol = symbols.find((s) => s.toString().includes('internal'));
  const dbWrapper = internalSymbol ? (corsair as any)[internalSymbol]?.database : undefined;

  const orm = createCorsairOrm(dbWrapper);
  
  // Upsert Gmail integration & initialize its DEK if missing
  let gmailIntegration = await orm.integrations.findByName('gmail');
  if (!gmailIntegration) {
    gmailIntegration = await orm.integrations.create({ name: 'gmail', config: {} });
  }
  if (!gmailIntegration.dek) {
    await initializeIntegrationDEK(dbWrapper, 'gmail', process.env.CORSAIR_KEK!);
  }

  // Upsert Calendar integration & initialize its DEK if missing
  let calendarIntegration = await orm.integrations.findByName('googlecalendar');
  if (!calendarIntegration) {
    calendarIntegration = await orm.integrations.create({ name: 'googlecalendar', config: {} });
  }
  if (!calendarIntegration.dek) {
    await initializeIntegrationDEK(dbWrapper, 'googlecalendar', process.env.CORSAIR_KEK!);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/corsair/auth/callback`;

  // 2. Configure global client ID/Secret for Gmail
  await corsair.keys.gmail.set_client_id(clientId);
  await corsair.keys.gmail.set_client_secret(clientSecret);
  await corsair.keys.gmail.set_redirect_url(redirectUri);

  // 3. Configure global client ID/Secret for Calendar
  await corsair.keys.googlecalendar.set_client_id(clientId);
  await corsair.keys.googlecalendar.set_client_secret(clientSecret);
  await corsair.keys.googlecalendar.set_redirect_url(redirectUri);
}
