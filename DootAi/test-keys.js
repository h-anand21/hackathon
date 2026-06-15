const { createCorsair } = require('corsair');
const { gmail } = require('@corsair-dev/gmail');
const { googlecalendar } = require('@corsair-dev/googlecalendar');
const { Pool } = require('pg');

try {
  const pool = new Pool();
  const corsair = createCorsair({
    plugins: [gmail(), googlecalendar()],
    database: pool,
    kek: 'ohQ9OjjjKV9fzrm09W0+vKr/X4YQtzXH3mSaALuFu3o=',
  });

  console.log('Available corsair keys:', Object.keys(corsair));
  console.log('Available corsair.keys properties/plugins:', Object.keys(corsair.keys));
  console.log('corsair.keys methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(corsair.keys)));
} catch (err) {
  console.error(err);
}
