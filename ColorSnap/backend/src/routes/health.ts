import { Router } from 'express';
import { getAiMode } from '../services/aiAnalysisService';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    ai_mode: getAiMode(),
    timestamp: new Date().toISOString()
  });
});

export default router;
