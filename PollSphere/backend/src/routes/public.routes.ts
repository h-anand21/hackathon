import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { submitResponseSchema } from '../validators/response.validator';
import { getPublicPoll, submitResponse } from '../controllers/response.controller';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Note: ClerkExpressWithAuth is "loose". It will verify tokens IF they are provided,
// putting req.auth on the request, but it WON'T block the request if no token is provided.
// This is perfect for our mixed anonymous/authenticated voting system.
const looseAuth = ClerkExpressWithAuth();

// GET /api/public/poll/:shareId - Fetch poll data for voting
router.get('/poll/:shareId', getPublicPoll);

// POST /api/public/poll/:shareId/submit - Submit a vote (Rate limited)
router.post('/poll/:shareId/submit', rateLimiter(10, 60), looseAuth, validate(submitResponseSchema), submitResponse);

// GET /api/public/poll/:shareId/results - View public stats (only if status is published)
import { getPublicResults } from '../controllers/analytics.controller';
router.get('/poll/:shareId/results', getPublicResults);

export default router;
