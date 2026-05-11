import { Router } from 'express';
import authRoutes from './auth.routes';
import pollRoutes from './poll.routes';
import questionRoutes, { questionRootRouter } from './question.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/polls', pollRoutes);
router.use('/polls/:id/questions', questionRoutes);
router.use('/questions', questionRootRouter);

export default router;
