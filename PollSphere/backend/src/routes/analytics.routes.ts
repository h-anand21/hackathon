import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getAnalytics } from '../controllers/analytics.controller';

const router = Router();

// Route: GET /api/analytics/:pollId
router.get('/:pollId', requireAuth, getAnalytics);

export default router;
