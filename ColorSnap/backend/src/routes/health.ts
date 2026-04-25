import { Router } from 'express';
import { getAiRuntimeStatus } from '../services/aiAnalysisService';

const router = Router();

router.get('/', (_req, res) => {
  const aiRuntime = getAiRuntimeStatus();

  res.json({
    status: 'ok',
    ai_mode: aiRuntime.mode,
    ai_status: aiRuntime.status,
    openai_configured: aiRuntime.openai_configured,
    timestamp: new Date().toISOString()
  });
});

export default router;
