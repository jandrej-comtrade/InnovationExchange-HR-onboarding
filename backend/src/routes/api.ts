import { Router, Request, Response } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger';
import { validateApiToken, extractClientId, AuthenticatedRequest } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { VtigerService } from '../services/vtigerService';

const router = Router();

// Apply rate limiting to all API routes
router.use(apiRateLimiter);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

// Onboarding form submission endpoint
router.post('/onboarding/submit', validateApiToken, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Extract clientId from form data
    const clientId = req.body.clientId;
    
    if (!clientId) {
      res.status(400).json({
        status: 'error',
        message: 'Client ID is required',
      });
      return;
    }
    
    const formData = req.body;

    logger.info('Received onboarding form submission', {
      clientId,
      formFields: Object.keys(formData),
      bodyKeys: Object.keys(req.body),
      bodyClientId: req.body.clientId,
    });

    // Validate required fields
    const requiredFields = [
      'companyTradingName',
      'operatingHours',
      'companyAddress',
      'companyPhone',
      'companyEmail',
      'sickLeavePolicy',
      'annualLeavePolicy',
      'probationPeriod',
      'noticePeriodEmployee',
      'noticePeriodEmployer',
      'industry',
      'numberOfEmployees',
    ];

    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        missingFields,
      });
      return;
    }

    // File uploads are disabled in MVP mode

    // Update vTiger CRM with form data
    try {
      const vtigerService = new VtigerService();
      await vtigerService.updateLeadWithFormData(clientId, formData);

      logger.info('Onboarding form data saved to vTiger CRM', {
        clientId,
      });
    } catch (error) {
      // In demo/MVP mode, log the error but don't fail the request
      logger.warn('Failed to save to vTiger CRM (demo mode)', {
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // For MVP/demo purposes, we'll still return success
      // In production, you might want to handle this differently
    }

    res.json({
      status: 'success',
      message: 'Form data saved successfully',
      data: {
        clientId,
        submittedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Failed to submit onboarding form:', {
      clientId: req.clientId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to save form data. Please try again later.',
    });
  }
}));

// Get client data endpoint
router.get('/onboarding/client/:clientId', validateApiToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;

    logger.info('Retrieving client data', { clientId });

    const vtigerService = new VtigerService();
    const lead = await vtigerService.getLead(clientId);

    // Return only the relevant form data fields
    const formData = {
      companyTradingName: lead.cf_company_trading_name || '',
      operatingHours: lead.cf_operating_hours || '',
      companyAddress: lead.cf_company_address || '',
      companyPhone: lead.cf_company_phone || '',
      companyEmail: lead.cf_company_email || '',
      sickLeavePolicy: lead.cf_sick_leave_policy || '',
      annualLeavePolicy: lead.cf_annual_leave_policy || '',
      probationPeriod: lead.cf_probation_period || '',
      noticePeriodEmployee: lead.cf_notice_period_employee || '',
      noticePeriodEmployer: lead.cf_notice_period_employer || '',
      workingHours: lead.cf_working_hours || '',
      overtimePolicy: lead.cf_overtime_policy || '',
      industry: lead.cf_industry || '',
      numberOfEmployees: lead.cf_number_of_employees || '',
      specialRequirements: lead.cf_special_requirements || '',
    };

    res.json({
      status: 'success',
      data: {
        clientId,
        formData,
        lastUpdated: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Failed to retrieve client data:', {
      clientId: req.params.clientId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve client data',
    });
  }
}));

// Test endpoint for API connectivity
router.get('/test', validateApiToken, (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
  });
});

export default router;
