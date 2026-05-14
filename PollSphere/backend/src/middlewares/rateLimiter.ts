import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';

export const rateLimiter = (limit: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `rate_limit:${req.path}:${ip}`;

    try {
      const requests = await redis.incr(key);

      if (requests === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (requests > limit) {
        return res.status(429).json({
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: windowSeconds
        });
      }

      next();
    } catch (error) {
      // If redis fails, allow the request to pass but log it
      console.error("Rate limiter error:", error);
      next();
    }
  };
};
