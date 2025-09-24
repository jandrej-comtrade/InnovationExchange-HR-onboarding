import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redis: Redis;

export const setupRedis = async (): Promise<void> => {
  try {
    const redisConfig: any = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, redisConfig);
    } else {
      redis = new Redis(redisConfig);
    }

    // Test connection
    await redis.ping();
    
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Redis setup failed:', error);
    throw error;
  }
};

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error('Redis not initialized. Call setupRedis() first.');
  }
  return redis;
};

export const closeRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    logger.info('Redis connection closed');
  }
};
