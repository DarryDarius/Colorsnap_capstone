import type { Request, Response, NextFunction } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
  keyGenerator?: (req: Request) => string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getClientAddress = (req: Request) => {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
};

const defaultKeyGenerator = (req: Request) => {
  return req.user?.id ? `user:${req.user.id}` : `ip:${getClientAddress(req)}`;
};

const pruneExpiredBuckets = () => {
  const timestamp = Date.now();

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= timestamp) {
      buckets.delete(key);
    }
  }
};

export const createRateLimiter = (options: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    pruneExpiredBuckets();

    const timestamp = Date.now();
    const rawKey = options.keyGenerator ? options.keyGenerator(req) : defaultKeyGenerator(req);
    const key = `${options.keyPrefix}:${rawKey}`;
    const current = buckets.get(key);
    const bucket = current && current.resetAt > timestamp
      ? current
      : { count: 0, resetAt: timestamp + options.windowMs };

    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(0, options.max - bucket.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - timestamp) / 1000));

    res.setHeader('X-RateLimit-Limit', String(options.max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', new Date(bucket.resetAt).toISOString());

    if (bucket.count > options.max) {
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many analysis requests. Please try again later.'
        }
      });
      return;
    }

    next();
  };
};

export const analysisStartRateLimiter = createRateLimiter({
  keyPrefix: 'analysis:start',
  windowMs: parsePositiveInteger(process.env.AI_ANALYSIS_RATE_LIMIT_WINDOW_MS, 60_000),
  max: parsePositiveInteger(process.env.AI_ANALYSIS_RATE_LIMIT_MAX, 3)
});
