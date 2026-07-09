import rateLimit from 'express-rate-limit';

// Standard API limiter (e.g., 100 requests / 15 mins)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter AI limiter (e.g., 10 requests / hr)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many AI requests from this IP, please try again after an hour'
  }
});

// Translation/ASR limiter — more generous than trip planning since calls are
// cheap and often chained (e.g., translating many short UI strings).
export const translationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 60, // Limit each IP to 60 translation/ASR requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many translation requests from this IP, please try again after 15 minutes'
  }
});
