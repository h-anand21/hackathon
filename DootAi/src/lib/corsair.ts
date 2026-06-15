import { Pool } from 'pg';
import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';

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
