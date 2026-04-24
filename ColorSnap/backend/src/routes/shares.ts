import { Router } from 'express';
import { createShare, fetchShare } from '../controllers/shareController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', optionalAuth, createShare);
router.get('/:share_id', fetchShare);

export default router;
