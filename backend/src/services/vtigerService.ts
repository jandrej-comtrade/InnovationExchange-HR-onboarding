import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { VtigerLead } from '../types';

export class VtigerService {
  private client: AxiosInstance;
  private accessKey: string;
  private username: string;

  constructor() {
    this.accessKey = process.env.VTIGER_ACCESS_KEY || '';
    this.username = process.env.VTIGER_USERNAME || '';
    
    if (!this.accessKey || !this.username) {
      throw new Error('vTiger credentials not configured');
    }

    this.client = axios.create({
      baseURL: process.env.VTIGER_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        accessKey: this.accessKey,
        username: this.username,
      };
      return config;
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('vTiger API response', {
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      (error) => {
        logger.error('vTiger API error', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  async getLead(leadId: string): Promise<VtigerLead> {
    try {
      const response: AxiosResponse = await this.client.get(`/Leads/${leadId}`);
      return response.data.result;
    } catch (error) {
      logger.error('Failed to get lead from vTiger', { leadId, error });
      throw new Error(`Failed to retrieve lead ${leadId} from vTiger`);
    }
  }

  async updateLead(leadId: string, data: Partial<VtigerLead>): Promise<VtigerLead> {
    try {
      const response: AxiosResponse = await this.client.put(`/Leads/${leadId}`, data);
      return response.data.result;
    } catch (error) {
      logger.error('Failed to update lead in vTiger', { leadId, data, error });
      throw new Error(`Failed to update lead ${leadId} in vTiger`);
    }
  }

  async updateLeadWithMaxioIds(
    leadId: string, 
    maxioCustomerId: string, 
    maxioSubscriptionId: string
  ): Promise<VtigerLead> {
    const updateData = {
      cf_maxio_customer_id: maxioCustomerId,
      cf_maxio_subscription_id: maxioSubscriptionId,
      leadstatus: 'Finance Setup Complete',
    };

    return this.updateLead(leadId, updateData);
  }

  async updateLeadWithFormData(leadId: string, formData: any): Promise<VtigerLead> {
    // Map form data to vTiger custom fields
    const updateData = {
      cf_company_trading_name: formData.companyTradingName,
      cf_operating_hours: formData.operatingHours,
      cf_company_address: formData.companyAddress,
      cf_company_phone: formData.companyPhone,
      cf_company_email: formData.companyEmail,
      cf_sick_leave_policy: formData.sickLeavePolicy,
      cf_annual_leave_policy: formData.annualLeavePolicy,
      cf_probation_period: formData.probationPeriod,
      cf_notice_period_employee: formData.noticePeriodEmployee,
      cf_notice_period_employer: formData.noticePeriodEmployer,
      cf_working_hours: formData.workingHours,
      cf_overtime_policy: formData.overtimePolicy,
      cf_industry: formData.industry,
      cf_number_of_employees: formData.numberOfEmployees,
      cf_special_requirements: formData.specialRequirements,
    };

    return this.updateLead(leadId, updateData);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/ping');
      return true;
    } catch (error) {
      logger.error('vTiger connection test failed', { error });
      return false;
    }
  }
}
