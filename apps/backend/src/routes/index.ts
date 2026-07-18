import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimit';
import placesRouter from './places';
import foodsRouter from './foods';
import festivalsRouter from './festivals';
import historyRouter from './history';
import searchRouter from './search';
import aiRouter from './ai';
import translateRouter from './translate';
import translationRouter from './translation';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

router.use('/places', placesRouter);
router.use('/foods', foodsRouter);
router.use('/festivals', festivalsRouter);
router.use('/history', historyRouter);
router.use('/search', searchRouter);
router.use('/ai', aiRouter);
router.use('/translate', translateRouter);
router.use('/translation', translationRouter);

export default router;
