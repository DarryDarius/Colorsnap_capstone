import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { ensureDatabaseReady, prisma } from './storageService';
import type { AuthTokenPayload, AuthUser } from '../types/auth';
import { ApiError } from '../utils/errors';

const createRecordId = (prefix: string) => {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${timestamp}_${random}`;
};

const nowIso = () => new Date().toISOString();
const passwordRounds = 10;
let googleOAuthClient: OAuth2Client | null = null;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'colorsnap-local-dev-secret-change-before-production';

  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new ApiError(500, 'AUTH_NOT_CONFIGURED', 'JWT_SECRET must be configured in production.');
  }

  return secret;
};

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    throw new ApiError(500, 'GOOGLE_AUTH_NOT_CONFIGURED', 'Google login is not configured.');
  }

  if (!googleOAuthClient) {
    googleOAuthClient = new OAuth2Client(clientId);
  }

  return {
    client: googleOAuthClient,
    clientId
  };
};

const toAuthUser = (user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
}): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name || undefined,
  role: user.role
});

export const createAuthToken = (user: AuthUser) => jwt.sign(
  {
    email: user.email,
    role: user.role
  },
  getJwtSecret(),
  {
    subject: user.id,
    expiresIn: '7d'
  }
);

export const verifyAuthToken = async (token: string): Promise<AuthUser | null> => {
  try {
    await ensureDatabaseReady();
    const payload = jwt.verify(token, getJwtSecret()) as AuthTokenPayload & { sub?: string };

    if (!payload.sub) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    });

    return user ? toAuthUser(user) : null;
  } catch {
    return null;
  }
};

export const registerUser = async (input: {
  email: string;
  password: string;
  name?: string;
}) => {
  await ensureDatabaseReady();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const name = input.name?.trim() || undefined;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'INVALID_AUTH_INPUT', 'Please enter a valid email address.');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'INVALID_AUTH_INPUT', 'Password must be at least 8 characters.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.');
  }

  const timestamp = nowIso();
  const user = await prisma.user.create({
    data: {
      id: createRecordId('usr'),
      email,
      passwordHash: await bcrypt.hash(password, passwordRounds),
      name,
      role: 'user',
      createdAt: timestamp,
      updatedAt: timestamp
    }
  });
  const authUser = toAuthUser(user);

  return {
    user: authUser,
    token: createAuthToken(authUser)
  };
};

export const loginUser = async (input: {
  email: string;
  password: string;
}) => {
  await ensureDatabaseReady();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  const authUser = toAuthUser(user);

  return {
    user: authUser,
    token: createAuthToken(authUser)
  };
};

export const loginWithGoogleCredential = async (credential: string) => {
  await ensureDatabaseReady();

  if (!credential.trim()) {
    throw new ApiError(400, 'INVALID_GOOGLE_CREDENTIAL', 'Google credential is required.');
  }

  const { client, clientId } = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId
  }).catch(() => {
    throw new ApiError(401, 'INVALID_GOOGLE_CREDENTIAL', 'Google credential could not be verified.');
  });
  const payload = ticket.getPayload();
  const email = normalizeEmail(payload?.email || '');

  if (!payload?.sub || !email || payload.email_verified !== true) {
    throw new ApiError(401, 'INVALID_GOOGLE_CREDENTIAL', 'Google account email could not be verified.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  let user = existingUser;

  if (user && payload.name && !user.name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: payload.name,
        updatedAt: nowIso()
      }
    });
  }

  if (!user) {
    const timestamp = nowIso();
    user = await prisma.user.create({
      data: {
        id: createRecordId('usr'),
        email,
        passwordHash: await bcrypt.hash(`google-oauth:${payload.sub}:${randomUUID()}`, passwordRounds),
        name: payload.name || undefined,
        role: 'user',
        createdAt: timestamp,
        updatedAt: timestamp
      }
    });
  }

  const authUser = toAuthUser(user);

  return {
    user: authUser,
    token: createAuthToken(authUser)
  };
};

export const getUserById = async (userId: string) => {
  await ensureDatabaseReady();
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return user ? toAuthUser(user) : null;
};
