import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const isRediss = redisUrl.startsWith('rediss://');

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    // Retry connection every 2 seconds
    return Math.min(times * 50, 2000);
  },
  // Upstash aur cloud databases me TLS connections (rediss://) enable karne ke liye options:
  ...(isRediss && {
    tls: {
      rejectUnauthorized: false
    }
  })
});

redis.on('connect', () => {
  console.log('✅ Redis Connected Successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});
