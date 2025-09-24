import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { MaxioCustomer, MaxioSubscription } from '../types';

export class MaxioService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MAXIO_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Maxio API key not configured');
    }

    this.client = axios.create({
      baseURL: process.env.MAXIO_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Maxio API response', {
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      (error) => {
        logger.error('Maxio API error', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  async createCustomer(customerData: {
    email: string;
    first_name: string;
    last_name: string;
    company: string;
    phone?: string;
    address?: string;
  }): Promise<MaxioCustomer> {
    try {
      const response: AxiosResponse = await this.client.post('/customers', {
        customer: customerData,
      });
      return response.data.customer;
    } catch (error) {
      logger.error('Failed to create customer in Maxio', { customerData, error });
      throw new Error('Failed to create customer in Maxio');
    }
  }

  async createSubscription(subscriptionData: {
    customer_id: string;
    product_handle: string;
    billing_cycle?: string;
    quantity?: number;
  }): Promise<MaxioSubscription> {
    try {
      const response: AxiosResponse = await this.client.post('/subscriptions', {
        subscription: {
          ...subscriptionData,
          billing_cycle: subscriptionData.billing_cycle || 'monthly',
          quantity: subscriptionData.quantity || 1,
        },
      });
      return response.data.subscription;
    } catch (error) {
      logger.error('Failed to create subscription in Maxio', { subscriptionData, error });
      throw new Error('Failed to create subscription in Maxio');
    }
  }

  async getCustomer(customerId: string): Promise<MaxioCustomer> {
    try {
      const response: AxiosResponse = await this.client.get(`/customers/${customerId}`);
      return response.data.customer;
    } catch (error) {
      logger.error('Failed to get customer from Maxio', { customerId, error });
      throw new Error(`Failed to retrieve customer ${customerId} from Maxio`);
    }
  }

  async getSubscription(subscriptionId: string): Promise<MaxioSubscription> {
    try {
      const response: AxiosResponse = await this.client.get(`/subscriptions/${subscriptionId}`);
      return response.data.subscription;
    } catch (error) {
      logger.error('Failed to get subscription from Maxio', { subscriptionId, error });
      throw new Error(`Failed to retrieve subscription ${subscriptionId} from Maxio`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try to get a list of customers to test the connection
      await this.client.get('/customers?per_page=1');
      return true;
    } catch (error) {
      logger.error('Maxio connection test failed', { error });
      return false;
    }
  }
}
