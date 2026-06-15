import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import pg from 'pg';
const { Pool } = pg;

import fs from 'fs';
import path from 'path';
import { createCorsairOrm } from 'corsair/orm';
import { initializeIntegrationDEK } from 'corsair/core';

try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
  const connectionString = dbUrlMatch ? dbUrlMatch[1] : 'postgresql://postgres:password@localhost:5432/dootai?schema=public';

  const pool = new Pool({
    connectionString,
  });
  
  const corsair = createCorsair({
    plugins: [gmail(), googlecalendar()],
    database: pool,
    kek: 'ohQ9OjjjKV9fzrm09W0+vKr/X4YQtzXH3mSaALuFu3o=',
  });

  const symbols = Object.getOwnPropertySymbols(corsair);
  const internalSymbol = symbols.find(s => s.toString().includes('internal'));
  const dbWrapper = corsair[internalSymbol].database;
  
  const orm = createCorsairOrm(dbWrapper);
  
  // Upsert integrations
  let gmailIntegration = await orm.integrations.findByName('gmail');
  if (!gmailIntegration) {
    gmailIntegration = await orm.integrations.create({ name: 'gmail', config: {} });
  }
  if (!gmailIntegration.dek) {
    await initializeIntegrationDEK(dbWrapper, 'gmail', 'ohQ9OjjjKV9fzrm09W0+vKr/X4YQtzXH3mSaALuFu3o=');
    console.log('Gmail DEK initialized successfully!');
  }

  let calendarIntegration = await orm.integrations.findByName('googlecalendar');
  if (!calendarIntegration) {
    calendarIntegration = await orm.integrations.create({ name: 'googlecalendar', config: {} });
  }
  if (!calendarIntegration.dek) {
    await initializeIntegrationDEK(dbWrapper, 'googlecalendar', 'ohQ9OjjjKV9fzrm09W0+vKr/X4YQtzXH3mSaALuFu3o=');
    console.log('Calendar DEK initialized successfully!');
  }

  // Verify set_client_id works
  await corsair.keys.gmail.set_client_id('test-client-id');
  console.log('Verification: set_client_id succeeded! Current client id:', await corsair.keys.gmail.get_client_id());

  const tenant = await corsair.manage.tenants.create({ id: 'test-user-id' });
  console.log('Tenant created successfully:', tenant.id);
} catch (err) {
  console.error(err);
}
