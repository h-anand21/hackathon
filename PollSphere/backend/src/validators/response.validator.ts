import { z } from 'zod';

export const submitResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string().optional(),
      optionIds: z.array(z.string()).optional()
    })
  ).min(1, "You must answer at least one question to submit")
});
