import { ClerkExpressRequireAuth, RequireAuthProp, StrictAuthProp } from '@clerk/clerk-sdk-node';

declare global {
  namespace Express {
    interface Request extends RequireAuthProp<StrictAuthProp> {}
  }
}

export const requireAuth = ClerkExpressRequireAuth();
