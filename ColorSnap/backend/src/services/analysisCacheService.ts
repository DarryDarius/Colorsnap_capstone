import crypto from 'crypto';
import type { AnalysisResult, UploadedImage } from '../types/analysis';

type CachedAnalysis = Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at' | 'error'>;

type CacheEntry = {
  result: CachedAnalysis;
  expiresAt: number;
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const maxEntries = parsePositiveInteger(process.env.AI_ANALYSIS_CACHE_MAX_ENTRIES, 100);
const ttlMs = parsePositiveInteger(process.env.AI_ANALYSIS_CACHE_TTL_MS, 7 * 24 * 60 * 60 * 1000);
const cacheVersion = process.env.AI_ANALYSIS_CACHE_VERSION?.trim() || 'korean-pc-v2.0-live';
const memoryCache = new Map<string, CacheEntry>();

export const createImageHash = (image: UploadedImage) => {
  return crypto
    .createHash('sha256')
    .update(cacheVersion)
    .update('\0')
    .update(image.mimeType)
    .update('\0')
    .update(image.buffer)
    .digest('hex');
};

const pruneExpired = () => {
  const timestamp = Date.now();

  for (const [hash, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= timestamp) {
      memoryCache.delete(hash);
    }
  }
};

const enforceMaxEntries = () => {
  while (memoryCache.size > maxEntries) {
    const oldestKey = memoryCache.keys().next().value as string | undefined;

    if (!oldestKey) {
      break;
    }

    memoryCache.delete(oldestKey);
  }
};

export const getCachedAnalysis = (imageHash: string): CachedAnalysis | null => {
  pruneExpired();
  const entry = memoryCache.get(imageHash);

  if (!entry) {
    return null;
  }

  memoryCache.delete(imageHash);
  memoryCache.set(imageHash, entry);
  return entry.result;
};

export const setCachedAnalysis = (imageHash: string, result: CachedAnalysis) => {
  pruneExpired();
  memoryCache.set(imageHash, {
    result,
    expiresAt: Date.now() + ttlMs
  });
  enforceMaxEntries();
};

export const getAnalysisCacheStatus = () => {
  pruneExpired();

  return {
    entries: memoryCache.size,
    max_entries: maxEntries,
    ttl_ms: ttlMs,
    version: cacheVersion
  };
};
