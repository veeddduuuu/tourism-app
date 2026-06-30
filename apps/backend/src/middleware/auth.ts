import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Clerk authentication middleware for protected routes
export const requireAuth = ClerkExpressRequireAuth();
