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

// UI State types
export interface OnboardingState {
  // Form Data
  formData: OnboardingFormData;
  
  // UI State
  currentSection: 'company' | 'policies' | 'additional' | 'review';
  isSubmitting: boolean;
  submitSuccess: boolean;
  errors: Record<string, string>;
  
  // Progress tracking
  completedSections: string[];
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
}

// Maxio types
export interface MaxioCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
}

export interface MaxioSubscription {
  id: string;
  customer_id: string;
  product_handle: string;
  state: string;
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

// Form section types
export interface FormSection {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  fields: string[];
}

// Component prop types
export interface FormFieldProps {
  id: string;
  label: string;
  value: string | File | null;
  onChange: (value: string | File | null) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file';
  options?: { value: string; label: string }[];
  rows?: number;
}

export interface ProgressTrackerProps {
  sections: FormSection[];
  currentSection: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}
