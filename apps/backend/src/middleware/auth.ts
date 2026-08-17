import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import type { Request, RequestHandler } from 'express';
import type { WithAuthProp } from '@clerk/clerk-sdk-node';

const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY);

function clerkRequireAuth(): RequestHandler {
  return ClerkExpressRequireAuth();
}

const clerkWithAuth: RequestHandler | null = clerkConfigured
  ? ClerkExpressWithAuth()
  : null;

/** Clerk user id from a request that has already passed auth middleware. */
export function getAuthUserId(req: Request): string | null {
  return (req as WithAuthProp<Request>).auth?.userId ?? null;
}

export function isClerkConfigured(): boolean {
  return clerkConfigured;
}

/**
 * Rejects unauthenticated requests with 401. Returns 503 when Clerk is not
 * configured so local catalog browsing still works without auth keys.
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!clerkConfigured) {
    res.status(503).json({ error: 'Auth is not configured' });
    return;
  }
  clerkRequireAuth()(req, res, next);
};

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
