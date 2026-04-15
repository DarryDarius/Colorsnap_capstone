import fs from 'fs';
import path from 'path';
import type { AnalysisResult } from '../types/analysis';

const analyses = new Map<string, AnalysisResult>();
const storageDirectory = path.resolve(__dirname, '../../.data');
const storageFilePath = path.join(storageDirectory, 'analyses.json');

const persistAnalyses = () => {
  fs.mkdirSync(storageDirectory, { recursive: true });
  fs.writeFileSync(
    storageFilePath,
    JSON.stringify(Object.fromEntries(analyses.entries()), null, 2),
    'utf8'
  );
};

const hydrateAnalyses = () => {
  try {
    if (!fs.existsSync(storageFilePath)) {
      return;
    }

    const rawContent = fs.readFileSync(storageFilePath, 'utf8').trim();
    if (!rawContent) {
      return;
    }

    const parsed = JSON.parse(rawContent) as Record<string, AnalysisResult>;

    for (const [analysisId, analysis] of Object.entries(parsed)) {
      analyses.set(analysisId, analysis);
    }
  } catch (error) {
    console.warn('[ColorSnap] Failed to hydrate stored analyses.', error);
  }
};

const createAnalysisId = () => {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `ana_${timestamp}_${random}`;
};

hydrateAnalyses();

export const createProcessingAnalysis = () => {
  const analysis: AnalysisResult = {
    analysis_id: createAnalysisId(),
    status: 'processing',
    created_at: new Date().toISOString()
  };

  analyses.set(analysis.analysis_id, analysis);
  persistAnalyses();
  return analysis;
};

export const getAnalysis = (analysisId: string) => {
  return analyses.get(analysisId) || null;
};

export const completeAnalysis = (
  analysisId: string,
  result: Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at'>
) => {
  const current = analyses.get(analysisId);
  if (!current) return null;

  const completed: AnalysisResult = {
    ...current,
    ...result,
    status: 'completed',
    completed_at: new Date().toISOString()
  };

  analyses.set(analysisId, completed);
  persistAnalyses();
  return completed;
};

export const failAnalysis = (analysisId: string, code: string, message: string) => {
  const current = analyses.get(analysisId);
  if (!current) return null;

  const failed: AnalysisResult = {
    ...current,
    status: 'failed',
    completed_at: new Date().toISOString(),
    error: {
      code,
      message
    }
  };

  analyses.set(analysisId, failed);
  persistAnalyses();
  return failed;
};

export const getStoredAnalysisCount = () => analyses.size;
