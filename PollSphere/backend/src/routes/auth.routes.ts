import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { syncUser } from '../controllers/auth.controller';

const router = Router();

// GET /api/auth/me - Syncs Clerk user with MongoDB
router.get('/me', requireAuth, syncUser);

export default router;
