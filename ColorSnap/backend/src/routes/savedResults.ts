import { Router } from 'express';
import { createSavedResult, fetchSavedResult } from '../controllers/savedResultController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', optionalAuth, createSavedResult);
router.get('/:saved_result_id', optionalAuth, fetchSavedResult);

export default router;
