import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../config/redis';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

const createRateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, message = 'Too many requests', keyGenerator } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = getRedis();
      const key = keyGenerator ? keyGenerator(req) : `rate_limit:${req.ip}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > max) {
        logger.warn(`Rate limit exceeded for key: ${key}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
        });

        res.status(429).json({
          status: 'error',
          message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
        return;
      }

      res.set({
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': Math.max(0, max - current).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
      });

      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // If Redis is down, allow the request to proceed
      next();
    }
  };
};

// General rate limiter
export const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Strict rate limiter for webhooks
export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: 'Too many webhook requests, please try again later.',
  keyGenerator: (req) => `webhook_rate_limit:${req.ip}`,
});

// API rate limiter
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many API requests, please try again later.',
  keyGenerator: (req) => `api_rate_limit:${req.ip}`,
});
