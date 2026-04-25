import { Router } from 'express';
import { fetchMySavedResults, fetchMyShares } from '../controllers/meController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);
router.get('/saved-results', fetchMySavedResults);
router.get('/shares', fetchMyShares);

export default router;
