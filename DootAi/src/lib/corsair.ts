import { Pool } from 'pg';
import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { createCorsairOrm } from 'corsair/orm';

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
  await orm.integrations.upsertByName('gmail', { config: {} });
  await orm.integrations.upsertByName('googlecalendar', { config: {} });

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/corsair/auth/callback`;

  // 2. Configure global client ID/Secret for Gmail
  const currentGmailClientId = await corsair.keys.gmail.get_client_id();
  if (currentGmailClientId !== clientId) {
    await corsair.keys.gmail.set_client_id(clientId);
    await corsair.keys.gmail.set_client_secret(clientSecret);
    await corsair.keys.gmail.set_redirect_url(redirectUri);
  }

  // 3. Configure global client ID/Secret for Calendar
  const currentCalendarClientId = await corsair.keys.googlecalendar.get_client_id();
  if (currentCalendarClientId !== clientId) {
    await corsair.keys.googlecalendar.set_client_id(clientId);
    await corsair.keys.googlecalendar.set_client_secret(clientSecret);
    await corsair.keys.googlecalendar.set_redirect_url(redirectUri);
  }
}
