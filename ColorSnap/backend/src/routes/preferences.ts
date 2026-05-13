import { Router } from 'express';
import { fetchBeautyPreferences, saveBeautyPreferences } from '../controllers/preferenceController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalAuth, fetchBeautyPreferences);
router.post('/', optionalAuth, saveBeautyPreferences);

export default router;
