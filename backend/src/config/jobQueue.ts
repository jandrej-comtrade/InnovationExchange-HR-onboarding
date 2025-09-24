import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedis } from './redis';
import { logger } from '../utils/logger';
import { processSyncJob } from '../workers/syncWorker';

let syncQueue: Queue;
let syncWorker: Worker;
let syncQueueEvents: QueueEvents;

export const setupJobQueue = async (): Promise<void> => {
  try {
    const redis = getRedis();
    
    // Create sync queue
    syncQueue = new Queue('sync-jobs', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Create worker
    syncWorker = new Worker('sync-jobs', processSyncJob, {
      connection: redis,
      concurrency: 5,
    });

    // Create queue events
    syncQueueEvents = new QueueEvents('sync-jobs', {
      connection: redis,
    });

    // Event listeners
    syncWorker.on('completed', (job) => {
      logger.info(`Sync job ${job.id} completed successfully`);
    });

    syncWorker.on('failed', (job, err) => {
      logger.error(`Sync job ${job?.id} failed:`, err);
    });

    syncWorker.on('error', (err) => {
      logger.error('Sync worker error:', err);
    });

    syncQueueEvents.on('waiting', ({ jobId }) => {
      logger.info(`Sync job ${jobId} is waiting`);
    });

    syncQueueEvents.on('active', ({ jobId }) => {
      logger.info(`Sync job ${jobId} is now active`);
    });

    logger.info('Job queue setup completed');
  } catch (error) {
    logger.error('Job queue setup failed:', error);
    throw error;
  }
};

export const getSyncQueue = (): Queue => {
  if (!syncQueue) {
    throw new Error('Sync queue not initialized. Call setupJobQueue() first.');
  }
  return syncQueue;
};

export const addSyncJob = async (jobData: any): Promise<any> => {
  const queue = getSyncQueue();
  return await queue.add('sync-job', jobData, {
    jobId: jobData.jobId,
  });
};

export const closeJobQueue = async (): Promise<void> => {
  if (syncWorker) {
    await syncWorker.close();
  }
  if (syncQueue) {
    await syncQueue.close();
  }
  if (syncQueueEvents) {
    await syncQueueEvents.close();
  }
  logger.info('Job queue closed');
};
