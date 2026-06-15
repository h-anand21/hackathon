import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/dootai?schema=public',
});

const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: pool,
  kek: 'ohQ9OjjjKV9fzrm09W0+vKr/X4YQtzXH3mSaALuFu3o=',
  multiTenancy: true,
});

console.log('Corsair keys:', Object.keys(corsair));
if (corsair.withTenant) {
  const tenantClient = corsair.withTenant('test-tenant');
  console.log('Tenant client keys:', Object.keys(tenantClient));
  if (tenantClient.gmail) {
    console.log('gmail keys:', Object.keys(tenantClient.gmail));
    if (tenantClient.gmail.api) {
      console.log('gmail.api keys:', Object.keys(tenantClient.gmail.api));
    }
  }
}

await pool.end();
