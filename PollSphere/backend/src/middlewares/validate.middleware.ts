import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Beginner friendly note: This middleware intercepts the incoming request.
// It checks if the `req.body` matches the provided Zod schema.
// If valid, it proceeds to the controller. If invalid, it immediately returns a 400 Bad Request.

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Attempt to parse the body using the schema
    req.body = schema.parse(req.body);
    next(); // Valid! Move to the next function (the controller)
  } catch (error: any) {
    res.status(400).json({ success: false, errors: error.errors });
  }
};
