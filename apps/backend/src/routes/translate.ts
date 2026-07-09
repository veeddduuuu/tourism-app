import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { cacheGet, cacheSet } from '../db/redis';
import { translateText, TranslationError } from '../services/translation';

const router = Router();

const TRANSLATION_CACHE_TTL = 7 * 24 * 60 * 60; // 7 days

const translateSchema = z.object({
  text: z.string().min(1).max(5000), // reasonable max length
  source: z.string().min(2).max(10), // e.g., "en", "hi"
  target: z.string().min(2).max(10),
});

// POST /api/translate
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, source, target } = translateSchema.parse(req.body);

    // Build cache key based on source, target, and the first 50 chars of text (like the plan)
    // Wait, the plan said `.slice(0, 50)`, but it's better to just hash it or use the whole string if small.
    // If we use only 50 chars, collisions will happen for long texts starting identically.
    // We'll use the whole text since we have max 5000 chars.
    const cacheKey = `tr:${source}:${target}:${text}`;

    const cached = await cacheGet<string>(cacheKey);
    if (cached) {
      res.json({ translation: cached, source, target, cached: true });
      return;
    }

    const translation = await translateText(text, source, target);

    // Best-effort cache
    await cacheSet(cacheKey, translation, TRANSLATION_CACHE_TTL);

    res.json({ translation, source, target, cached: false });
  } catch (err) {
    if (err instanceof TranslationError) {
      res.status(502).json({ error: 'Translation failed', detail: err.message });
      return;
    }
    next(err);
  }
});

export default router;
