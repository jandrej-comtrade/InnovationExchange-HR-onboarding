-- Initialize the database with required tables and indexes
-- This script runs when the PostgreSQL container starts for the first time

-- Create sync_jobs table
CREATE TABLE IF NOT EXISTS sync_jobs (
    job_id VARCHAR(255) PRIMARY KEY,
    vtiger_lead_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    maxio_customer_id VARCHAR(255),
    maxio_subscription_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_logs table
CREATE TABLE IF NOT EXISTS application_logs (
    log_id VARCHAR(255) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sync_jobs_vtiger_lead_id ON sync_jobs(vtiger_lead_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_created_at ON sync_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp ON application_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs(level);

-- Insert some sample data for testing (optional)
INSERT INTO application_logs (log_id, level, message, context) 
VALUES (
    'init-' || extract(epoch from now())::text,
    'info',
    'Database initialized successfully',
    '{"service": "database-init", "version": "1.0.0"}'::jsonb
) ON CONFLICT (log_id) DO NOTHING;
