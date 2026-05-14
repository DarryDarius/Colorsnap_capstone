import { ApiError } from '../utils/errors';
import type { AnalysisResult, UploadedImage } from '../types/analysis';
import { getProductRecommendations } from './productRecommendationService';
import { analyzeImage } from './aiAnalysisService';
import {
  claimNextAnalysisJob,
  completeAnalysis,
  completeAnalysisJob,
  enqueueAnalysisJob,
  failAnalysis,
  failAnalysisJobPermanently,
  getAnalysisQueueStats,
  getCachedAnalysisResult,
  pruneExpiredAnalysisCache,
  releaseStaleAnalysisJobs,
  requeueAnalysisJob,
  upsertCachedAnalysisResult
} from './storageService';
import {
  createImageHash,
  getAnalysisCacheStatus,
  getCachedAnalysis,
  setCachedAnalysis
} from './analysisCacheService';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const maxWorkerConcurrency = parsePositiveInteger(process.env.AI_ANALYSIS_WORKER_CONCURRENCY, 2);
const maxJobAttempts = parsePositiveInteger(process.env.AI_ANALYSIS_JOB_MAX_ATTEMPTS, 3);
const retryBaseDelayMs = parsePositiveInteger(process.env.AI_ANALYSIS_JOB_RETRY_BASE_MS, 2_000);
const staleJobMs = parsePositiveInteger(process.env.AI_ANALYSIS_JOB_STALE_MS, 5 * 60_000);
const cacheTtlMs = parsePositiveInteger(process.env.AI_ANALYSIS_CACHE_TTL_MS, 7 * 24 * 60 * 60 * 1000);

let activeWorkers = 0;
let queueDrainScheduled = false;

const withProducts = (result: Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at' | 'error'>) => {
  if (!result.season_result || !result.attributes) {
    return result;
  }

  return {
    ...result,
    products: result.products || getProductRecommendations({
      primarySeason: result.season_result.primary,
      secondarySeason: result.season_result.secondary,
      attributes: result.attributes,
      limit: 16
    })
  };
};

const getErrorCode = (error: unknown) => {
  return error instanceof ApiError ? error.code : 'MODEL_ERROR';
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Analysis could not be completed.';
};

const shouldRetry = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return true;
  }

  return [
    'AI_CIRCUIT_OPEN',
    'MODEL_TIMEOUT',
    'OPENAI_API_ERROR',
    'OPENAI_RESPONSE_INVALID',
    'OPENAI_REQUEST_FAILED'
  ].includes(error.code);
};

const getRetryDelayMs = (attempts: number) => {
  const exponentialDelay = retryBaseDelayMs * (2 ** Math.max(0, attempts - 1));
  const jitter = Math.floor(Math.random() * retryBaseDelayMs);
  return Math.min(exponentialDelay + jitter, 60_000);
};

const completeFromCache = async (analysisId: string, imageHash: string) => {
  const memoryCached = getCachedAnalysis(imageHash);
  const cached = memoryCached || await getCachedAnalysisResult(imageHash);

  if (!cached) {
    return false;
  }

  const result = withProducts(cached);
  setCachedAnalysis(imageHash, result);
  await completeAnalysis(analysisId, result);
  return true;
};

const processJob = async () => {
  const job = await claimNextAnalysisJob();

  if (!job) {
    return false;
  }

  try {
    const cached = await completeFromCache(job.analysis_id, job.image_hash);

    if (cached) {
      await completeAnalysisJob(job.analysis_id);
      return true;
    }

    const image: UploadedImage = {
      fieldName: 'image',
      originalName: job.original_name,
      mimeType: job.mime_type,
      source: job.source,
      size: job.image_buffer.length,
      buffer: job.image_buffer
    };
    const modelResult = await analyzeImage(image);
    const result = withProducts(modelResult);

    await completeAnalysis(job.analysis_id, result);
    setCachedAnalysis(job.image_hash, result);
    await upsertCachedAnalysisResult(job.image_hash, result, cacheTtlMs);
    await completeAnalysisJob(job.analysis_id);
    return true;
  } catch (error) {
    const code = getErrorCode(error);
    const message = getErrorMessage(error);

    if (job.attempts < job.max_attempts && shouldRetry(error)) {
      await requeueAnalysisJob(job.analysis_id, code, message, getRetryDelayMs(job.attempts));
      return true;
    }

    await failAnalysis(job.analysis_id, code, message);
    await failAnalysisJobPermanently(job.analysis_id, code, message);
    return true;
  }
};

const drainQueue = async () => {
  if (queueDrainScheduled) {
    return;
  }

  queueDrainScheduled = true;

  while (activeWorkers < maxWorkerConcurrency) {
    activeWorkers += 1;

    void (async () => {
      try {
        const processedJob = await processJob();
        if (processedJob) {
          scheduleQueueDrain(100);
        }
      } finally {
        activeWorkers = Math.max(0, activeWorkers - 1);
        queueDrainScheduled = false;
      }
    })();
  }
};

const scheduleQueueDrain = (delayMs = 1_000) => {
  setTimeout(() => {
    void drainQueue();
  }, delayMs).unref();
};

export const enqueueAnalysis = async (input: {
  analysisId: string;
  userId?: string | null;
  image: UploadedImage;
  imageHash?: string;
}) => {
  const imageHash = input.imageHash || createImageHash(input.image);

  await enqueueAnalysisJob({
    analysisId: input.analysisId,
    userId: input.userId,
    source: input.image.source || 'web',
    imageHash,
    mimeType: input.image.mimeType,
    originalName: input.image.originalName,
    imageBuffer: input.image.buffer,
    maxAttempts: maxJobAttempts
  });
  scheduleQueueDrain(0);
};

export const completeAnalysisIfCached = async (analysisId: string, imageHash: string) => {
  return completeFromCache(analysisId, imageHash);
};

export const startAnalysisQueueWorker = () => {
  void releaseStaleAnalysisJobs(staleJobMs);
  void pruneExpiredAnalysisCache();
  scheduleQueueDrain(0);

  setInterval(() => {
    void releaseStaleAnalysisJobs(staleJobMs);
    scheduleQueueDrain(0);
  }, 10_000).unref();

  setInterval(() => {
    void pruneExpiredAnalysisCache();
  }, 60_000).unref();
};

export const getAnalysisQueueRuntimeStatus = async () => ({
  worker: {
    max_concurrent: maxWorkerConcurrency,
    active: activeWorkers
  },
  jobs: await getAnalysisQueueStats(),
  memory_cache: getAnalysisCacheStatus()
});
