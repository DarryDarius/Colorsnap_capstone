import type { AnalysisResult } from '../types/analysis';

const analyses = new Map<string, AnalysisResult>();

const createAnalysisId = () => {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `ana_${timestamp}_${random}`;
};

export const createProcessingAnalysis = () => {
  const analysis: AnalysisResult = {
    analysis_id: createAnalysisId(),
    status: 'processing',
    created_at: new Date().toISOString()
  };

  analyses.set(analysis.analysis_id, analysis);
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
  return failed;
};
