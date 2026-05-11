import { z } from 'zod';

// Beginner friendly note: Zod ensures our API only receives valid data
// before we ever touch the database, preventing crashes and bad data.

export const createPollSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  responseMode: z.enum(['anonymous', 'authenticated']),
  // We expect an ISO date string from the frontend for expiry
  expiresAt: z.string().datetime()
});

export const updatePollSchema = createPollSchema.partial().extend({
  status: z.enum(['draft', 'active', 'expired', 'published']).optional()
});
