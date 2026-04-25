import type { Request, Response } from 'express';
import {
  listSavedResultRecordsForUser,
  listShareRecordsForUser
} from '../services/storageService';
import { toErrorResponse } from '../utils/errors';

export const fetchMySavedResults = async (req: Request, res: Response) => {
  try {
    res.json({
      items: await listSavedResultRecordsForUser(req.user!.id)
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchMyShares = async (req: Request, res: Response) => {
  try {
    res.json({
      items: await listShareRecordsForUser(req.user!.id)
    });
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
