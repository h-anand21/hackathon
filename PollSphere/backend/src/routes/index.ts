import { Router } from 'express';
import authRoutes from './auth.routes';
import pollRoutes from './poll.routes';
import questionRoutes, { questionRootRouter } from './question.routes';
import publicRoutes from './public.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/polls', pollRoutes);
router.use('/polls/:id/questions', questionRoutes);
router.use('/questions', questionRootRouter);
router.use('/public', publicRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
