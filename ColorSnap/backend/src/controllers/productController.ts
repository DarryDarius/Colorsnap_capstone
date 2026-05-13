import type { Request, Response } from 'express';
import { getAnalysis } from '../services/storageService';
import {
  getProductCatalogSummary,
  getProductDetailBySlug,
  getProductRecommendations
} from '../services/productRecommendationService';
import type { Brightness, Contrast, ProductCategory, Saturation, Season, Undertone } from '../types/analysis';
import { ApiError, toErrorResponse } from '../utils/errors';

export const fetchProductRecommendations = (req: Request, res: Response) => {
  try {
    const season = req.query.season as Season | undefined;
    const undertone = req.query.undertone as Undertone | undefined;

    if (!season || !undertone) {
      throw new ApiError(400, 'INVALID_REQUEST', 'season and undertone query params are required.');
    }

    const limit = req.query.limit ? Number(req.query.limit) : 6;

    const input = {
      primarySeason: season,
      secondarySeason: null,
      attributes: {
        undertone,
        brightness: (req.query.brightness as Brightness | undefined) || 'medium',
        saturation: (req.query.saturation as Saturation | undefined) || 'medium',
        contrast: (req.query.contrast as Contrast | undefined) || 'medium'
      },
      category: req.query.category as ProductCategory | undefined,
      limit: Number.isFinite(limit) ? limit : 6
    };

    res.json({
      items: getProductRecommendations(input),
      meta: {
        profile: {
          season,
          undertone,
          brightness: input.attributes.brightness,
          saturation: input.attributes.saturation,
          contrast: input.attributes.contrast
        },
        catalog: getProductCatalogSummary()
      }
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchProductDetail = async (req: Request, res: Response) => {
  try {
    const product = getProductDetailBySlug(req.params.slug);

    if (!product) {
      throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product was not found.');
    }

    const analysisId = req.query.analysis_id as string | undefined;
    const analysis = analysisId ? await getAnalysis(analysisId) : null;

    if (
      analysis?.status === 'completed' &&
      analysis.season_result &&
      analysis.attributes &&
      analysis.products
    ) {
      const matchingRecommendation = analysis.products.find((item) => item.slug === product.slug);

      if (matchingRecommendation) {
        res.json({
          ...product,
          why_it_matches_you: matchingRecommendation.reason,
          best_for: matchingRecommendation.badges.length > 0 ? matchingRecommendation.badges : product.best_for
        });
        return;
      }
    }

    res.json(product);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
