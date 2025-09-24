import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  clientId?: string;
}

// Middleware to validate API token
export const validateApiToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.APP_SECRET_TOKEN;

  if (!expectedToken) {
    logger.error('APP_SECRET_TOKEN not configured');
    return next(createError('Server configuration error', 500));
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid authorization header', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    return next(createError('Missing or invalid authorization token', 401));
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (token !== expectedToken) {
    logger.warn('Invalid API token', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    return next(createError('Invalid authorization token', 401));
  }

  next();
};

// Middleware to validate webhook signature
export const validateWebhookSignature = (req: Request, res: Response, next: NextFunction): void => {
  const signature = req.headers['x-vtiger-signature'] as string;
  const webhookSecret = process.env.VTIGER_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('VTIGER_WEBHOOK_SECRET not configured');
    return next(createError('Server configuration error', 500));
  }

  if (!signature) {
    logger.warn('Missing webhook signature', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    return next(createError('Missing webhook signature', 401));
  }

  // In a real implementation, you would validate the HMAC signature here
  // For the MVP, we'll do a simple string comparison
  if (signature !== webhookSecret) {
    logger.warn('Invalid webhook signature', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    return next(createError('Invalid webhook signature', 401));
  }

  next();
};

// Middleware to extract client ID from request
export const extractClientId = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const clientId = req.body.clientId || req.query.clientId;

  if (!clientId) {
    return next(createError('Client ID is required', 400));
  }

  req.clientId = clientId;
  next();
};
