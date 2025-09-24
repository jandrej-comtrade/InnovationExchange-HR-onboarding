import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool;

export const setupDatabase = async (): Promise<void> => {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    // Create tables if they don't exist
    await createTables();
    
    logger.info('Database setup completed');
  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  const client = await pool.connect();
  
  try {
    // Create sync_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sync_jobs (
        job_id VARCHAR(255) PRIMARY KEY,
        vtiger_lead_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        maxio_customer_id VARCHAR(255),
        maxio_subscription_id VARCHAR(255),
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create application_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS application_logs (
        log_id VARCHAR(255) PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        context JSONB
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sync_jobs_vtiger_lead_id ON sync_jobs(vtiger_lead_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp ON application_logs(timestamp)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs(level)
    `);

    logger.info('Database tables created/verified');
  } finally {
    client.release();
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call setupDatabase() first.');
  }
  return pool;
};

export const getClient = async (): Promise<PoolClient> => {
  const pool = getPool();
  return await pool.connect();
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
};
