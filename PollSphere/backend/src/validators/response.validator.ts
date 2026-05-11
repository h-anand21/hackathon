import { z } from 'zod';

export const submitResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string()
    })
  ).min(1, "You must answer at least one question to submit")
});
