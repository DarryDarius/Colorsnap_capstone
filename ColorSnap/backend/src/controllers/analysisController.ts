import type { Request, Response } from 'express';
import {
  createAnalysisFeedbackRecord,
  createProcessingAnalysis,
  getAnalysis,
  getAnalysisFeedbackRecords
} from '../services/storageService';
import { completeAnalysisIfCached, enqueueAnalysis } from '../services/analysisQueueService';
import { createImageHash } from '../services/analysisCacheService';
import { ApiError, toErrorResponse } from '../utils/errors';
import { parseUploadedImage } from '../utils/validation';

export const createAnalysis = async (req: Request, res: Response) => {
  try {
    const image = await parseUploadedImage(req);
    const analysis = await createProcessingAnalysis(req.user?.id, image.source);
    const imageHash = createImageHash(image);
    const completedFromCache = await completeAnalysisIfCached(analysis.analysis_id, imageHash);

    if (!completedFromCache) {
      await enqueueAnalysis({
        analysisId: analysis.analysis_id,
        userId: req.user?.id,
        image,
        imageHash
      });
    }

    res.status(201).json({
      analysis_id: analysis.analysis_id,
      status: completedFromCache ? 'completed' : analysis.status,
      created_at: analysis.created_at,
      poll_url: `/api/v1/analyses/${analysis.analysis_id}`
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchAnalysis = async (req: Request, res: Response) => {
  try {
    const analysis = await getAnalysis(req.params.analysis_id);

    if (!analysis) {
      throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
    }

    res.json(analysis);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

const allowedFeedbackTags = new Set(['season', 'undertone', 'palette', 'makeup', 'fashion', 'photo_quality', 'other']);

export const createAnalysisFeedback = async (req: Request, res: Response) => {
  try {
    const analysis = await getAnalysis(req.params.analysis_id);

    if (!analysis) {
      throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
    }

    const body = req.body as Record<string, unknown>;
    const rating = Number(body.rating);
    const issueTags = Array.isArray(body.issue_tags)
      ? body.issue_tags.filter((tag): tag is string => typeof tag === 'string' && allowedFeedbackTags.has(tag))
      : [];
    const userNote = typeof body.user_note === 'string' ? body.user_note.trim().slice(0, 800) : undefined;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ApiError(400, 'INVALID_FEEDBACK', 'rating must be an integer from 1 to 5.');
    }

    const feedback = await createAnalysisFeedbackRecord({
      analysis_id: analysis.analysis_id,
      user_id: req.user?.id,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      issue_tags: issueTags as Array<'season' | 'undertone' | 'palette' | 'makeup' | 'fashion' | 'photo_quality' | 'other'>,
      user_note: userNote || undefined
    });

    res.status(201).json(feedback);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchAnalysisFeedback = async (req: Request, res: Response) => {
  try {
    const analysis = await getAnalysis(req.params.analysis_id);

    if (!analysis) {
      throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
    }

    res.json({
      items: await getAnalysisFeedbackRecords(analysis.analysis_id)
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
