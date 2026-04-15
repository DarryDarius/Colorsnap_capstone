import { Router } from 'express';
import { createAnalysis, fetchAnalysis } from '../controllers/analysisController';

const router = Router();

router.post('/', createAnalysis);
router.get('/:analysis_id', fetchAnalysis);

export default router;
