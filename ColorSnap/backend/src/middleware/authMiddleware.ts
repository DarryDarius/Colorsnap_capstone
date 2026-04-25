import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../services/authService';

const extractBearerToken = (header: string | undefined) => {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.header('Authorization'));

  if (token) {
    const user = await verifyAuthToken(token);

    if (user) {
      req.user = user;
    }
  }

  next();
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.header('Authorization'));
  const user = token ? await verifyAuthToken(token) : null;

  if (!user) {
    res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Please log in to continue.'
      }
    });
    return;
  }

  req.user = user;
  next();
};
