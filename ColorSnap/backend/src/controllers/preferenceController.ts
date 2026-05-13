import type { Request, Response } from 'express';
import { getProductRecommendations } from '../services/productRecommendationService';
import {
  createOrUpdateBeautyPreferenceRecord,
  getAnalysis,
  getBeautyPreferenceRecord,
  updateAnalysisProducts
} from '../services/storageService';
import type {
  BeautyPreferenceInput,
  BudgetRange,
  MakeupStyle,
  ProductFinish,
  ShoppingGoal
} from '../types/analysis';
import { ApiError, toErrorResponse } from '../utils/errors';

const makeupStyles = new Set<MakeupStyle>(['natural', 'polished', 'soft_glam', 'bold', 'glam']);
const budgetRanges = new Set<BudgetRange>(['flexible', 'drugstore', 'mid_range', 'luxury']);
const shoppingGoals = new Set<ShoppingGoal>(['full_look', 'lipstick', 'blush', 'eyes', 'base', 'fashion']);
const finishes = new Set<ProductFinish>(['matte', 'satin', 'dewy', 'natural', 'shimmer']);

const cleanStringArray = (value: unknown, max = 8) => (
  Array.isArray(value)
    ? value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, max)
    : []
);

const parsePreferenceInput = (body: Record<string, unknown>): BeautyPreferenceInput => {
  const analysisId = typeof body.analysis_id === 'string' ? body.analysis_id.trim() : '';
  const makeupStyle = body.makeup_style as MakeupStyle;
  const budgetRange = body.budget_range as BudgetRange;
  const shoppingGoal = body.shopping_goal as ShoppingGoal;
  const preferredFinishes = cleanStringArray(body.preferred_finishes)
    .filter((finish): finish is ProductFinish => finishes.has(finish as ProductFinish));

  if (!analysisId) {
    throw new ApiError(400, 'INVALID_REQUEST', 'analysis_id is required.');
  }

  if (!makeupStyles.has(makeupStyle)) {
    throw new ApiError(400, 'INVALID_REQUEST', 'makeup_style is invalid.');
  }

  if (!budgetRanges.has(budgetRange)) {
    throw new ApiError(400, 'INVALID_REQUEST', 'budget_range is invalid.');
  }

  if (!shoppingGoals.has(shoppingGoal)) {
    throw new ApiError(400, 'INVALID_REQUEST', 'shopping_goal is invalid.');
  }

  return {
    analysis_id: analysisId,
    makeup_style: makeupStyle,
    budget_range: budgetRange,
    shopping_goal: shoppingGoal,
    preferred_finishes: preferredFinishes,
    preferred_brands: cleanStringArray(body.preferred_brands),
    avoid_colors: cleanStringArray(body.avoid_colors)
  };
};

export const saveBeautyPreferences = async (req: Request, res: Response) => {
  try {
    const input = parsePreferenceInput(req.body || {});
    const analysis = await getAnalysis(input.analysis_id);

    if (!analysis) {
      throw new ApiError(404, 'ANALYSIS_NOT_FOUND', 'Analysis was not found.');
    }

    if (analysis.status !== 'completed' || !analysis.season_result || !analysis.attributes) {
      throw new ApiError(409, 'ANALYSIS_NOT_READY', 'Beauty preferences can be applied after the analysis is completed.');
    }

    const preference = await createOrUpdateBeautyPreferenceRecord({
      ...input,
      user_id: req.user?.id || undefined
    });
    const products = getProductRecommendations({
      primarySeason: analysis.season_result.primary,
      secondarySeason: analysis.season_result.secondary,
      attributes: analysis.attributes,
      preferences: preference,
      limit: 16
    });

    await updateAnalysisProducts(analysis.analysis_id, products);

    res.status(201).json({
      preference,
      products
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchBeautyPreferences = async (req: Request, res: Response) => {
  try {
    const analysisId = req.query.analysis_id as string | undefined;

    if (!analysisId) {
      throw new ApiError(400, 'INVALID_REQUEST', 'analysis_id query param is required.');
    }

    const preference = await getBeautyPreferenceRecord(analysisId);

    if (!preference) {
      throw new ApiError(404, 'PREFERENCES_NOT_FOUND', 'Beauty preferences were not found.');
    }

    res.json({ preference });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
