import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import type { RequestHandler } from 'express';

// Clerk authentication middleware for protected routes — rejects with 401 when
// no valid session is present.
export const requireAuth = ClerkExpressRequireAuth();

// Clerk needs both keys to authenticate a request. When they're absent (e.g.
// local dev without Clerk wired up) we skip auth entirely rather than 500.
const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY);
const clerkWithAuth: RequestHandler | null = clerkConfigured ? ClerkExpressWithAuth() : null;

/**
 * Optional authentication: populates `req.auth.userId` when a valid Clerk
 * session exists, but always lets the request through. Anonymous callers (and
 * environments without Clerk configured) simply get `req.auth === undefined`.
 * Clerk runtime failures fall through to anonymous instead of erroring.
 */
export const optionalAuth: RequestHandler = (req, res, next) => {
  if (!clerkWithAuth) {
    next();
    return;
  }
  clerkWithAuth(req, res, (err?: unknown) => {
    if (err) {
      console.warn('[auth] optional Clerk auth failed, continuing anonymously');
    }
    next();
  });
};
