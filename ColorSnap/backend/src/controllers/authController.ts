import type { Request, Response } from 'express';
import { loginUser, loginWithGoogleCredential, registerUser } from '../services/authService';
import { toErrorResponse } from '../utils/errors';

const getString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const result = await registerUser({
      email: getString(body.email),
      password: getString(body.password),
      name: getString(body.name) || undefined
    });

    res.status(201).json(result);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const result = await loginUser({
      email: getString(body.email),
      password: getString(body.password)
    });

    res.json(result);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const result = await loginWithGoogleCredential(getString(body.credential));

    res.json(result);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const me = (req: Request, res: Response) => {
  res.json({
    user: req.user
  });
};

export const logout = (_req: Request, res: Response) => {
  res.status(204).send();
};
