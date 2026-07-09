import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { translationLimiter } from '../middleware/rateLimit';
import { optionalAuth } from '../middleware/auth';
import {
  translate,
  transcribe,
  transcribeAndTranslate,
  SUPPORTED_LANGUAGES,
  BhashiniError,
} from '../services/bhashini';

const router = Router();

const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  source: z.string().min(2).max(5),
  target: z.string().min(2).max(5),
});

const transcribeSchema = z.object({
  audioContent: z.string().min(1), // base64-encoded audio
  source: z.string().min(2).max(5),
  audioFormat: z.string().default('wav'),
  samplingRate: z.coerce.number().int().positive().default(16000),
});

const sttTranslateSchema = transcribeSchema.extend({
  target: z.string().min(2).max(5),
});

// Maps a BhashiniError to 502 (upstream failure); anything else bubbles to the
// global error handler. Mirrors the TripGenerationError handling in ai.ts.
function handleServiceError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof BhashiniError) {
    res.status(502).json({ error: 'Bhashini request failed', detail: err.message });
    return;
  }
  next(err);
}

// GET /translation/languages — the languages this pipeline can handle
router.get('/languages', (_req: Request, res: Response) => {
  const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
    code,
    name,
  }));
  res.json({ data: languages, total: languages.length });
});

// POST /translation/translate — text → text between two Indian languages
router.post(
  '/translate',
  translationLimiter,
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, source, target } = translateSchema.parse(req.body);
      const result = await translate(text, source, target);
      res.json({ data: result });
    } catch (err) {
      handleServiceError(err, res, next);
    }
  }
);

// POST /translation/transcribe — speech-to-text (ASR) for one language
router.post(
  '/transcribe',
  translationLimiter,
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { audioContent, source, audioFormat, samplingRate } =
        transcribeSchema.parse(req.body);
      const result = await transcribe(audioContent, source, audioFormat, samplingRate);
      res.json({ data: result });
    } catch (err) {
      handleServiceError(err, res, next);
    }
  }
);

// POST /translation/speech-to-translation — ASR then translate the transcript.
// This is the "translate once text is parsed" flow: audio in `source`, text out
// in both `source` (transcript) and `target` (translation).
router.post(
  '/speech-to-translation',
  translationLimiter,
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { audioContent, source, target, audioFormat, samplingRate } =
        sttTranslateSchema.parse(req.body);
      const result = await transcribeAndTranslate(
        audioContent,
        source,
        target,
        audioFormat,
        samplingRate
      );
      res.json({ data: result });
    } catch (err) {
      handleServiceError(err, res, next);
    }
  }
);

export default router;
