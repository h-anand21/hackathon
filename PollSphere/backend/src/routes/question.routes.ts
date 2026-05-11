import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createQuestionSchema } from '../validators/question.validator';
import { createQuestion } from '../controllers/question.controller';

// mergeParams allows us to access the :id from the parent router (/api/polls/:id)
const router = Router({ mergeParams: true }); 

// Route: POST /api/polls/:id/questions
router.post('/', requireAuth, validate(createQuestionSchema), createQuestion);

// Notice: The following routes are logically /api/questions/:id 
// but since this router is mounted at /api/polls/:id/questions, we need a separate mapping in index.ts for /api/questions 
// Let's export them to be mapped properly.

import { updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { updateQuestionSchema } from '../validators/question.validator';

const singleQuestionRouter = Router();
singleQuestionRouter.patch('/:id', requireAuth, validate(updateQuestionSchema), updateQuestion);
singleQuestionRouter.delete('/:id', requireAuth, deleteQuestion);

export const questionRootRouter = singleQuestionRouter;
export default router;
