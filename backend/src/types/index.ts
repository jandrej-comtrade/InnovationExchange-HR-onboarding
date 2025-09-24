// Form data types
export interface OnboardingFormData {
  // Company Details
  companyTradingName: string;
  operatingHours: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  // HR Policies
  sickLeavePolicy: string;
  annualLeavePolicy: string;
  probationPeriod: string;
  noticePeriodEmployee: string;
  noticePeriodEmployer: string;
  workingHours: string;
  overtimePolicy: string;
  
  // Additional Information
  industry: string;
  numberOfEmployees: string;
  specialRequirements: string;
  
  // Supporting Documents
  supportingDocument?: File | null;
}

// API Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface SyncJobStatus {
  job_id: string;
  vtiger_lead_id: string;
  status: 'pending' | 'processing' | 'maxio_created' | 'crm_updated' | 'failed';
  maxio_customer_id?: string;
  maxio_subscription_id?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// vTiger CRM types
export interface VtigerLead {
  id: string;
  company: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  leadstatus: string;
  cf_iban?: string;
  cf_maxio_customer_id?: string;
  cf_maxio_subscription_id?: string;
  cf_company_trading_name?: string;
  cf_operating_hours?: string;
  cf_company_address?: string;
  cf_company_phone?: string;
  cf_company_email?: string;
  cf_sick_leave_policy?: string;
  cf_annual_leave_policy?: string;
  cf_probation_period?: string;
  cf_notice_period_employee?: string;
  cf_notice_period_employer?: string;
  cf_working_hours?: string;
  cf_overtime_policy?: string;
  cf_industry?: string;
  cf_number_of_employees?: string;
  cf_special_requirements?: string;
}

// Maxio types
export interface MaxioCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone?: string;
  address?: string;
}

export interface MaxioSubscription {
  id: string;
  customer_id: string;
  product_handle: string;
  state: string;
  billing_cycle?: string;
  quantity?: number;
}

// Webhook types
export interface VtigerWebhookPayload {
  event: string;
  module: string;
  record_id: string;
  data: {
    leadstatus: string;
    cf_iban?: string;
    company: string;
    email: string;
    firstname: string;
    lastname: string;
    phone?: string;
  };
}

// Job types
export interface SyncJobData {
  jobId: string;
  vtiger_lead_id: string;
  lead_data: VtigerWebhookPayload['data'];
}

// Database types
export interface SyncJobRecord {
  job_id: string;
  vtiger_lead_id: string;
  status: string;
  maxio_customer_id?: string;
  maxio_subscription_id?: string;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApplicationLogRecord {
  log_id: string;
  timestamp: Date;
  level: string;
  message: string;
  context?: any;
}
