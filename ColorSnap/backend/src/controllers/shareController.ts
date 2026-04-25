import type { Request, Response } from 'express';
import {
  createShareRecord,
  getAnalysis,
  getSavedResultRecord,
  getShareRecord
} from '../services/storageService';
import { ApiError, toErrorResponse } from '../utils/errors';

const getString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getCompletedAnalysis = async (analysisId: string) => {
  const analysis = await getAnalysis(analysisId);

  if (!analysis) {
    throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
  }

  if (analysis.status !== 'completed' || !analysis.season_result || !analysis.summary) {
    throw new ApiError(400, 'ANALYSIS_NOT_READY', 'Analysis must be completed before it can be shared.');
  }

  return analysis;
};

export const createShare = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const analysisId = getString(body.analysis_id);

    if (!analysisId) {
      throw new ApiError(400, 'INVALID_SHARE', 'analysis_id is required.');
    }

    const analysis = await getCompletedAnalysis(analysisId);
    const savedResultId = getString(body.saved_result_id) || undefined;

    if (savedResultId) {
      const savedResult = await getSavedResultRecord(savedResultId);

      if (!savedResult) {
        throw new ApiError(404, 'SAVED_RESULT_NOT_FOUND', 'Saved result was not found.');
      }

      if (savedResult.user_id && savedResult.user_id !== req.user?.id) {
        throw new ApiError(403, 'SAVED_RESULT_FORBIDDEN', 'You do not have access to this saved result.');
      }
    }

    const primarySeason = analysis.season_result!.primary;
    const summary = analysis.summary!.one_liner;
    const share = await createShareRecord({
      analysis_id: analysis.analysis_id,
      user_id: req.user?.id,
      saved_result_id: savedResultId,
      visibility: 'unlisted',
      title: `My ColorSnap Result: ${primarySeason}`,
      description: summary,
      primary_season: primarySeason,
      secondary_season: analysis.season_result!.secondary,
      palette: (analysis.recommended_palette || []).slice(0, 8).map((color) => ({
        name: color.name,
        hex: color.hex
      })),
      include_photo: body.include_photo === true,
      image_url: null
    });

    res.status(201).json(share);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchShare = async (req: Request, res: Response) => {
  try {
    const share = await getShareRecord(req.params.share_id);

    if (!share) {
      throw new ApiError(404, 'SHARE_NOT_FOUND', 'Shared result was not found.');
    }

    res.json(share);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
