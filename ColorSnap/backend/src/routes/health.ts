import { Router } from 'express';
import { getAiRuntimeStatus } from '../services/aiAnalysisService';
import { getAnalysisQueueRuntimeStatus } from '../services/analysisQueueService';
import { getAiResilienceStatus } from '../services/resilienceService';
import { getStoredAnalysisCacheCount } from '../services/storageService';

const router = Router();

router.get('/', async (_req, res) => {
  const aiRuntime = getAiRuntimeStatus();
  const queueRuntime = await getAnalysisQueueRuntimeStatus();

  res.json({
    status: 'ok',
    ai_mode: aiRuntime.mode,
    ai_status: aiRuntime.status,
    openai_configured: aiRuntime.openai_configured,
    resilience: getAiResilienceStatus(),
    analysis_queue: queueRuntime,
    persisted_cache_entries: await getStoredAnalysisCacheCount(),
    timestamp: new Date().toISOString()
  });
});

export default router;
