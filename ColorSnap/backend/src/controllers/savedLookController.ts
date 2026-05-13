import type { Request, Response } from 'express';
import {
  addProductToDefaultSavedLook,
  createSavedLookRecord,
  deleteSavedLookRecord,
  getAnalysis,
  getSavedLookRecord,
  listSavedLookRecords,
  updateSavedLookRecord
} from '../services/storageService';
import type { ProductRecommendation } from '../types/analysis';
import { ApiError, toErrorResponse } from '../utils/errors';

const getString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getCompletedAnalysis = async (analysisId: string) => {
  const analysis = await getAnalysis(analysisId);

  if (!analysis) {
    throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
  }

  if (analysis.status !== 'completed') {
    throw new ApiError(409, 'ANALYSIS_NOT_READY', 'Analysis must be completed before saving a look.');
  }

  return analysis;
};

const parseProduct = (value: unknown): ProductRecommendation => {
  const product = value as ProductRecommendation;

  if (!product || !product.id || !product.slug || !product.name || !product.price || !product.currency) {
    throw new ApiError(400, 'INVALID_SAVED_LOOK', 'A valid recommendation product is required.');
  }

  return product;
};

const ensureLookAccess = (look: Awaited<ReturnType<typeof getSavedLookRecord>>, userId?: string) => {
  if (!look) {
    throw new ApiError(404, 'SAVED_LOOK_NOT_FOUND', 'Saved look was not found.');
  }

  if (look.user_id && look.user_id !== userId) {
    throw new ApiError(403, 'SAVED_LOOK_FORBIDDEN', 'You do not have access to this saved look.');
  }

  return look;
};

export const createSavedLook = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const analysisId = getString(body.analysis_id);

    if (!analysisId) {
      throw new ApiError(400, 'INVALID_SAVED_LOOK', 'analysis_id is required.');
    }

    await getCompletedAnalysis(analysisId);

    const look = await createSavedLookRecord({
      user_id: req.user?.id,
      analysis_id: analysisId,
      name: getString(body.name) || 'Personalized Color Look',
      occasion: getString(body.occasion) || 'Everyday',
      products: Array.isArray(body.products) ? body.products.map(parseProduct) : [],
      notes: getString(body.notes) || undefined
    });

    res.status(201).json(look);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const addProductToSavedLook = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const analysisId = getString(body.analysis_id);

    if (!analysisId) {
      throw new ApiError(400, 'INVALID_SAVED_LOOK', 'analysis_id is required.');
    }

    await getCompletedAnalysis(analysisId);

    const look = await addProductToDefaultSavedLook({
      userId: req.user?.id,
      analysisId,
      product: parseProduct(body.product)
    });

    res.status(201).json(look);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchSavedLooks = async (req: Request, res: Response) => {
  try {
    const looks = await listSavedLookRecords({
      userId: req.user?.id,
      analysisId: getString(req.query.analysis_id)
    });

    res.json({ items: looks });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const updateSavedLook = async (req: Request, res: Response) => {
  try {
    const currentLook = ensureLookAccess(await getSavedLookRecord(req.params.look_id), req.user?.id);
    const body = req.body as Record<string, unknown>;
    const products = Array.isArray(body.products) ? body.products.map(parseProduct) : undefined;
    const look = await updateSavedLookRecord(currentLook.look_id, {
      name: getString(body.name) || undefined,
      occasion: getString(body.occasion) || undefined,
      notes: body.notes === null ? '' : getString(body.notes) || undefined,
      products
    });

    res.json(look);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const deleteSavedLook = async (req: Request, res: Response) => {
  try {
    const look = ensureLookAccess(await getSavedLookRecord(req.params.look_id), req.user?.id);
    await deleteSavedLookRecord(look.look_id);
    res.status(204).send();
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
