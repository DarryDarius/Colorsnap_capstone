import type { Request, Response } from 'express';
import { getProductRecommendations } from '../services/productRecommendationService';
import type { Brightness, ProductCategory, Saturation, Season, Undertone } from '../types/analysis';
import { ApiError, toErrorResponse } from '../utils/errors';

export const fetchProductRecommendations = (req: Request, res: Response) => {
  try {
    const season = req.query.season as Season | undefined;
    const undertone = req.query.undertone as Undertone | undefined;

    if (!season || !undertone) {
      throw new ApiError(400, 'INVALID_REQUEST', 'season and undertone query params are required.');
    }

    const limit = req.query.limit ? Number(req.query.limit) : 6;

    res.json({
      items: getProductRecommendations({
        primarySeason: season,
        secondarySeason: null,
        attributes: {
          undertone,
          brightness: (req.query.brightness as Brightness | undefined) || 'medium',
          saturation: (req.query.saturation as Saturation | undefined) || 'medium',
          contrast: 'medium'
        },
        category: req.query.category as ProductCategory | undefined,
        limit: Number.isFinite(limit) ? limit : 6
      })
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
