import { Router } from 'express';
import {
  createAnalysis,
  createAnalysisFeedback,
  fetchAnalysis,
  fetchAnalysisFeedback
} from '../controllers/analysisController';

const router = Router();

router.post('/', createAnalysis);
router.post('/:analysis_id/feedback', createAnalysisFeedback);
router.get('/:analysis_id/feedback', fetchAnalysisFeedback);
router.get('/:analysis_id', fetchAnalysis);

export default router;
