import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { validateWebhookSignature } from '../middleware/auth';
import { webhookRateLimiter } from '../middleware/rateLimiter';
import { addSyncJob } from '../config/jobQueue';
import { getPool } from '../config/database';
import { VtigerWebhookPayload } from '../types';

const router = Router();

// Apply rate limiting to all webhook routes
router.use(webhookRateLimiter);

// vTiger webhook endpoint
router.post('/vtiger/lead-status-change', validateWebhookSignature, async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: VtigerWebhookPayload = req.body;
    
    logger.info('Received vTiger webhook', {
      event: payload.event,
      module: payload.module,
      record_id: payload.record_id,
      leadstatus: payload.data?.leadstatus,
    });

    // Validate payload
    if (payload.event !== 'record.update' || payload.module !== 'Leads') {
      logger.info('Ignoring non-relevant webhook event', {
        event: payload.event,
        module: payload.module,
      });
      res.status(200).json({ status: 'ignored' });
      return;
    }

    // Check if this is the trigger we're looking for
    if (payload.data.leadstatus !== 'Ready for Finance Setup') {
      logger.info('Ignoring webhook - lead status not ready for finance setup', {
        leadstatus: payload.data.leadstatus,
      });
      res.status(200).json({ status: 'ignored' });
      return;
    }

    // Validate required fields
    if (!payload.data.cf_iban) {
      logger.warn('Webhook missing IBAN field', {
        record_id: payload.record_id,
        data: payload.data,
      });
      res.status(400).json({
        status: 'error',
        message: 'IBAN field is required for finance setup',
      });
      return;
    }

    // Create sync job
    const jobId = uuidv4();
    const jobData = {
      jobId,
      vtiger_lead_id: payload.record_id,
      lead_data: payload.data,
    };

    // Store job in database
    const pool = getPool();
    await pool.query(
      `INSERT INTO sync_jobs (job_id, vtiger_lead_id, status, created_at, updated_at)
       VALUES ($1, $2, 'pending', NOW(), NOW())`,
      [jobId, payload.record_id]
    );

    // Add job to queue
    await addSyncJob(jobData);

    logger.info('Sync job created and queued', {
      jobId,
      vtiger_lead_id: payload.record_id,
    });

    res.status(200).json({
      status: 'received',
      jobId,
      message: 'Sync job created and queued successfully',
    });

  } catch (error) {
    logger.error('Webhook processing error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body,
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to process webhook',
    });
  }
});

// Webhook status endpoint
router.get('/vtiger/status/:jobId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'SELECT * FROM sync_jobs WHERE job_id = $1',
      [jobId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Job not found',
      });
      return;
    }

    const job = result.rows[0];
    res.json({
      status: 'success',
      data: {
        job_id: job.job_id,
        vtiger_lead_id: job.vtiger_lead_id,
        status: job.status,
        maxio_customer_id: job.maxio_customer_id,
        maxio_subscription_id: job.maxio_subscription_id,
        error_message: job.error_message,
        created_at: job.created_at,
        updated_at: job.updated_at,
      },
    });

  } catch (error) {
    logger.error('Error retrieving job status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve job status',
    });
  }
});

export default router;
