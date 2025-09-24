import { Router, Request, Response } from 'express';
import { getRedis } from '../config/redis';
import { getPool } from '../config/database';
import { VtigerService } from '../services/vtigerService';
import { MaxioService } from '../services/maxioService';
import { logger } from '../utils/logger';

const router = Router();

// Basic health check
router.get('/', async (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hr-onboarding-backend',
    version: '1.0.0',
  });
});

// Detailed health check with dependencies
router.get('/detailed', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hr-onboarding-backend',
    version: '1.0.0',
    dependencies: {
      database: 'unknown',
      redis: 'unknown',
      vtiger: 'unknown',
      maxio: 'unknown',
    },
  };

  try {
    // Check database
    const pool = getPool();
    await pool.query('SELECT 1');
    health.dependencies.database = 'healthy';
  } catch (error) {
    health.dependencies.database = 'unhealthy';
    health.status = 'degraded';
    logger.error('Database health check failed:', error);
  }

  try {
    // Check Redis
    const redis = getRedis();
    await redis.ping();
    health.dependencies.redis = 'healthy';
  } catch (error) {
    health.dependencies.redis = 'unhealthy';
    health.status = 'degraded';
    logger.error('Redis health check failed:', error);
  }

  try {
    // Check vTiger
    const vtigerService = new VtigerService();
    const vtigerHealthy = await vtigerService.testConnection();
    health.dependencies.vtiger = vtigerHealthy ? 'healthy' : 'unhealthy';
    if (!vtigerHealthy) health.status = 'degraded';
  } catch (error) {
    health.dependencies.vtiger = 'unhealthy';
    health.status = 'degraded';
    logger.error('vTiger health check failed:', error);
  }

  try {
    // Check Maxio
    const maxioService = new MaxioService();
    const maxioHealthy = await maxioService.testConnection();
    health.dependencies.maxio = maxioHealthy ? 'healthy' : 'unhealthy';
    if (!maxioHealthy) health.status = 'degraded';
  } catch (error) {
    health.dependencies.maxio = 'unhealthy';
    health.status = 'degraded';
    logger.error('Maxio health check failed:', error);
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
