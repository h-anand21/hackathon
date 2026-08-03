import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPollSchema } from '../validators/poll.validator';
import { createPoll, getMyPolls, getPollById } from '../controllers/poll.controller';

const router = Router();

// Route: GET /api/polls
router.get('/', requireAuth, getMyPolls);

// Route: POST /api/polls
router.post('/', requireAuth, validate(createPollSchema), createPoll);

// Route: GET /api/polls/:id
router.get('/:id', requireAuth, getPollById);

// Route: PATCH /api/polls/:id
import { updatePollSchema } from '../validators/poll.validator';
import { updatePoll, deletePoll } from '../controllers/poll.controller';
router.patch('/:id', requireAuth, validate(updatePollSchema), updatePoll);
router.put('/:id', requireAuth, validate(updatePollSchema), updatePoll);

// Route: DELETE /api/polls/:id
router.delete('/:id', requireAuth, deletePoll);

export default router;
