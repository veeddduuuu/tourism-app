import { Router, Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { z } from 'zod';
import { getAuthUserId, optionalAuth, requireAuth } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function serializeUser(user: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: { emailAddress: string }[];
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    email: user.emailAddresses[0]?.emailAddress ?? null,
  };
}

/** GET /auth/me — current Clerk user. 401 when unsigned; 503 without Clerk keys. */
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await clerkClient.users.getUser(userId);
    res.json(serializeUser(user));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/session — lightweight check used by the app to confirm the JWT
 * round-trip without hitting Clerk's user API.
 */
router.get('/session', optionalAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  res.json({
    authenticated: Boolean(userId),
    userId,
  });
});

/**
 * POST /auth/register — create a Clerk user via the Backend API so email is
 * already verified (needed for testing without the email-code flow).
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      res.status(503).json({ error: 'Auth is not configured' });
      return;
    }

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Enter a valid email and a password of at least 8 characters' });
      return;
    }

    const { email, password } = parsed.data;

    try {
      const user = await clerkClient.users.createUser({
        emailAddress: [email],
        password,
        skipPasswordChecks: true,
      });
      res.status(201).json({ created: true, user: serializeUser(user) });
    } catch (err: unknown) {
      const clerkErr = err as { status?: number; errors?: { code?: string; message?: string }[] };
      const code = clerkErr.errors?.[0]?.code ?? '';
      const message = clerkErr.errors?.[0]?.message ?? '';
      const exists =
        clerkErr.status === 422 &&
        /exist|taken|already|identifier/i.test(`${code} ${message}`);

      if (exists) {
        res.status(200).json({ created: false, existing: true });
        return;
      }

      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
