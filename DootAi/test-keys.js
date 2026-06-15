import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import pg from 'pg';
const { Pool } = pg;

import fs from 'fs';
import path from 'path';
import { createCorsairOrm } from 'corsair/orm';

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
  console.log('Symbols on corsair:', symbols.map(s => s.toString()));
  
  const internalSymbol = symbols.find(s => s.toString().toLowerCase().includes('internal'));
  const internalConfig = corsair[internalSymbol];
  console.log('internalConfig database properties:', Object.keys(internalConfig.database));
  
  const orm = createCorsairOrm(internalConfig.database);
  console.log('orm integrations check:', Object.keys(orm.integrations));

  const tenant = await corsair.manage.tenants.create({ id: 'test-user-id' });
  console.log('tenant own properties:', Object.getOwnPropertyNames(tenant));
  console.log('tenant prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(tenant)));
  console.log('tenant.accounts own properties:', Object.getOwnPropertyNames(tenant.accounts));
  if (tenant.connectedPlugins) {
    console.log('tenant.connectedPlugins own properties:', Object.getOwnPropertyNames(tenant.connectedPlugins));
  }
} catch (err) {
  console.error(err);
}
