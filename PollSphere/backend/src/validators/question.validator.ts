import { z } from 'zod';

export const createQuestionSchema = z.object({
  text: z.string().min(5, "Question must be at least 5 characters").max(300),
  isMandatory: z.boolean().default(true),
  // A question must have an array of string options, minimum 2 choices
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "A question must have at least 2 options")
});

export const updateQuestionSchema = z.object({
  text: z.string().min(5).max(300).optional(),
  isMandatory: z.boolean().optional()
  // Note: Changing options typically requires deleting/recreating or a complex diff logic
  // For this hackathon, we'll keep option updates simple or handle them separately.
});
