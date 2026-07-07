import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimit';
import placesRouter from './places';
import foodsRouter from './foods';
import festivalsRouter from './festivals';
import historyRouter from './history';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

router.use('/places', placesRouter);
router.use('/foods', foodsRouter);
router.use('/festivals', festivalsRouter);
router.use('/history', historyRouter);

// TODO: mount domain routers once implemented
// router.use('/search', searchRouter);

export default router;
