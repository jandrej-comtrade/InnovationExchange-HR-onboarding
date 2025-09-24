import { Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { getPool } from '../config/database';
import { VtigerService } from '../services/vtigerService';
import { MaxioService } from '../services/maxioService';
import { SyncJobData, SyncJobRecord } from '../types';

export const processSyncJob = async (job: Job<SyncJobData>): Promise<void> => {
  const { jobId, vtiger_lead_id, lead_data } = job.data;
  const pool = getPool();
  
  let maxioCustomerId: string | null = null;
  let maxioSubscriptionId: string | null = null;

  try {
    logger.info(`Starting sync job ${jobId} for lead ${vtiger_lead_id}`);

    // Update job status to processing
    await updateSyncJobStatus(pool, jobId, 'processing');

    // Initialize services
    const vtigerService = new VtigerService();
    const maxioService = new MaxioService();

    // Step 1: Create Customer in Maxio
    logger.info(`Creating customer in Maxio for lead ${vtiger_lead_id}`);
    
    const customerData = {
      email: lead_data.email,
      first_name: lead_data.firstname,
      last_name: lead_data.lastname,
      company: lead_data.company,
      phone: lead_data.phone,
    };

    const customer = await maxioService.createCustomer(customerData);
    maxioCustomerId = customer.id;
    
    logger.info(`Customer created in Maxio with ID: ${maxioCustomerId}`);
    await updateSyncJobStatus(pool, jobId, 'maxio_created', { maxioCustomerId });

    // Step 2: Create Subscription in Maxio
    logger.info(`Creating subscription in Maxio for customer ${maxioCustomerId}`);
    
    const subscriptionData = {
      customer_id: maxioCustomerId,
      product_handle: process.env.MAXIO_DEFAULT_PRODUCT_HANDLE || 'default-hr-package',
      billing_cycle: 'monthly',
      quantity: 1,
    };

    const subscription = await maxioService.createSubscription(subscriptionData);
    maxioSubscriptionId = subscription.id;
    
    logger.info(`Subscription created in Maxio with ID: ${maxioSubscriptionId}`);

    // Step 3: Update CRM with Maxio IDs
    logger.info(`Updating vTiger lead ${vtiger_lead_id} with Maxio IDs`);
    
    await vtigerService.updateLeadWithMaxioIds(
      vtiger_lead_id,
      maxioCustomerId,
      maxioSubscriptionId
    );

    // Job Success
    await updateSyncJobStatus(pool, jobId, 'crm_updated', {
      maxioCustomerId,
      maxioSubscriptionId,
    });

    logger.info(`Sync job ${jobId} completed successfully`, {
      vtiger_lead_id,
      maxioCustomerId,
      maxioSubscriptionId,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Sync job ${jobId} failed:`, {
      vtiger_lead_id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Update job status to failed
    await updateSyncJobStatus(pool, jobId, 'failed', {
      error_message: errorMessage,
    });

    throw error; // Re-throw to trigger BullMQ retry mechanism
  }
};

async function updateSyncJobStatus(
  pool: any,
  jobId: string,
  status: string,
  additionalData?: { maxioCustomerId?: string; maxioSubscriptionId?: string; error_message?: string }
): Promise<void> {
  try {
    const updateFields = ['status = $2', 'updated_at = NOW()'];
    const values = [jobId, status];
    let paramIndex = 3;

    if (additionalData?.maxioCustomerId) {
      updateFields.push(`maxio_customer_id = $${paramIndex}`);
      values.push(additionalData.maxioCustomerId);
      paramIndex++;
    }

    if (additionalData?.maxioSubscriptionId) {
      updateFields.push(`maxio_subscription_id = $${paramIndex}`);
      values.push(additionalData.maxioSubscriptionId);
      paramIndex++;
    }

    if (additionalData?.error_message) {
      updateFields.push(`error_message = $${paramIndex}`);
      values.push(additionalData.error_message);
      paramIndex++;
    }

    const query = `
      UPDATE sync_jobs 
      SET ${updateFields.join(', ')}
      WHERE job_id = $1
    `;

    await pool.query(query, values);
  } catch (error) {
    logger.error('Failed to update sync job status:', { jobId, status, error });
  }
}
