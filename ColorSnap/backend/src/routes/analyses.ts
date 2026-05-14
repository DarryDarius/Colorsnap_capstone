import { Router } from 'express';
import {
  createAnalysis,
  createAnalysisFeedback,
  fetchAnalysis,
  fetchAnalysisFeedback
} from '../controllers/analysisController';
import { optionalAuth } from '../middleware/authMiddleware';
import { analysisStartRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', optionalAuth, analysisStartRateLimiter, createAnalysis);
router.post('/:analysis_id/feedback', optionalAuth, createAnalysisFeedback);
router.get('/:analysis_id/feedback', fetchAnalysisFeedback);
router.get('/:analysis_id', fetchAnalysis);

export default router;
