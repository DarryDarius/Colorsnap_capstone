import type { Request, Response } from 'express';
import { analyzeImageWithMockAi } from '../services/aiAnalysisService';
import { getProductRecommendations } from '../services/productRecommendationService';
import {
  completeAnalysis,
  createProcessingAnalysis,
  failAnalysis,
  getAnalysis
} from '../services/storageService';
import { ApiError, toErrorResponse } from '../utils/errors';
import { parseUploadedImage } from '../utils/validation';

const processAnalysis = async (analysisId: string, image: Awaited<ReturnType<typeof parseUploadedImage>>) => {
  try {
    const modelResult = await analyzeImageWithMockAi(image);
    const products = getProductRecommendations({
      primarySeason: modelResult.season_result!.primary,
      secondarySeason: modelResult.season_result!.secondary,
      attributes: modelResult.attributes!,
      limit: 6
    });

    completeAnalysis(analysisId, {
      ...modelResult,
      products
    });
  } catch (error) {
    failAnalysis(
      analysisId,
      'MODEL_TIMEOUT',
      error instanceof Error ? error.message : 'Analysis could not be completed.'
    );
  }
};

export const createAnalysis = async (req: Request, res: Response) => {
  try {
    const image = await parseUploadedImage(req);
    const analysis = createProcessingAnalysis();

    void processAnalysis(analysis.analysis_id, image);

    res.status(201).json({
      analysis_id: analysis.analysis_id,
      status: analysis.status,
      created_at: analysis.created_at,
      poll_url: `/api/v1/analyses/${analysis.analysis_id}`
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchAnalysis = (req: Request, res: Response) => {
  try {
    const analysis = getAnalysis(req.params.analysis_id);

    if (!analysis) {
      throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
    }

    res.json(analysis);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
