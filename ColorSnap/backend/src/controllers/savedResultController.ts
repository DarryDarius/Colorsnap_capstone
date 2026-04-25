import type { Request, Response } from 'express';
import {
  createSavedResultRecord,
  getAnalysis,
  getSavedResultRecord
} from '../services/storageService';
import { ApiError, toErrorResponse } from '../utils/errors';

const getString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getCompletedAnalysis = async (analysisId: string) => {
  const analysis = await getAnalysis(analysisId);

  if (!analysis) {
    throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
  }

  if (analysis.status !== 'completed' || !analysis.season_result || !analysis.summary) {
    throw new ApiError(400, 'ANALYSIS_NOT_READY', 'Analysis must be completed before it can be saved.');
  }

  return analysis;
};

export const createSavedResult = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const analysisId = getString(body.analysis_id);

    if (!analysisId) {
      throw new ApiError(400, 'INVALID_SAVED_RESULT', 'analysis_id is required.');
    }

    const analysis = await getCompletedAnalysis(analysisId);
    const savedResult = await createSavedResultRecord({
      analysis_id: analysis.analysis_id,
      user_id: req.user?.id,
      title: `My ColorSnap Result: ${analysis.season_result!.primary}`,
      primary_season: analysis.season_result!.primary,
      secondary_season: analysis.season_result!.secondary,
      confidence: analysis.season_result!.confidence,
      palette: analysis.recommended_palette || [],
      summary: analysis.summary!.one_liner,
      include_photo: body.include_photo === true
    });

    res.status(201).json(savedResult);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchSavedResult = async (req: Request, res: Response) => {
  try {
    const savedResult = await getSavedResultRecord(req.params.saved_result_id);

    if (!savedResult) {
      throw new ApiError(404, 'SAVED_RESULT_NOT_FOUND', 'Saved result was not found.');
    }

    if (savedResult.user_id && savedResult.user_id !== req.user?.id) {
      throw new ApiError(403, 'SAVED_RESULT_FORBIDDEN', 'You do not have access to this saved result.');
    }

    res.json(savedResult);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
