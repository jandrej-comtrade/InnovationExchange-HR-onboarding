'use client';

import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { OnboardingState, OnboardingFormData } from '@/types';

// Action types
type OnboardingAction =
  | { type: 'UPDATE_FIELD'; field: keyof OnboardingFormData; value: string | File | null }
  | { type: 'SET_CURRENT_SECTION'; section: OnboardingState['currentSection'] }
  | { type: 'SUBMIT_FORM' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'SET_ERROR'; field: string; message: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'LOAD_SAVED_DATA'; data: Partial<OnboardingFormData> }
  | { type: 'RESET_FORM' };

// Initial state
const initialFormData: OnboardingFormData = {
  companyTradingName: '',
  operatingHours: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  sickLeavePolicy: '',
  annualLeavePolicy: '',
  probationPeriod: '',
  noticePeriodEmployee: '',
  noticePeriodEmployer: '',
  workingHours: '',
  overtimePolicy: '',
  industry: '',
  numberOfEmployees: '',
  specialRequirements: '',
  supportingDocument: null,
};

const initialState: OnboardingState = {
  formData: initialFormData,
  currentSection: 'company',
  isSubmitting: false,
  submitSuccess: false,
  errors: {},
  completedSections: [],
};

// Reducer function
const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      const newFormData = { ...state.formData, [action.field]: action.value };
      return {
        ...state,
        formData: newFormData,
        errors: { ...state.errors, [action.field]: '' }, // Clear error when field is updated
      };

    case 'SET_CURRENT_SECTION':
      return {
        ...state,
        currentSection: action.section,
      };

    case 'SUBMIT_FORM':
      return {
        ...state,
        isSubmitting: true,
        errors: {},
      };

    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        submitSuccess: true,
      };

    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        errors: { general: action.error },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };

    case 'CLEAR_ERROR':
      const { [action.field]: removed, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors,
      };

    case 'LOAD_SAVED_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.data },
      };

    case 'RESET_FORM':
      return {
        ...initialState,
        currentSection: state.currentSection,
      };

    default:
      return state;
  }
};

// Context type
interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  updateField: (field: keyof OnboardingFormData, value: string | File | null) => void;
  setCurrentSection: (section: OnboardingState['currentSection']) => void;
  submitForm: () => Promise<void>;
  validateSection: (section: string) => boolean;
  isFieldValid: (field: keyof OnboardingFormData) => boolean;
  getFieldError: (field: string) => string;
}

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider component
export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Load saved data from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('onboardingFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dispatch({ type: 'LOAD_SAVED_DATA', data: parsed });
      } catch (error) {
        console.error('Failed to parse saved form data:', error);
      }
    }
  }, []);

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    const formDataToSave = { ...state.formData };
    // Remove file objects as they can't be serialized
    if (formDataToSave.supportingDocument) {
      delete formDataToSave.supportingDocument;
    }
    sessionStorage.setItem('onboardingFormData', JSON.stringify(formDataToSave));
  }, [state.formData]);

  // Helper functions
  const updateField = (field: keyof OnboardingFormData, value: string | File | null) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const setCurrentSection = (section: OnboardingState['currentSection']) => {
    dispatch({ type: 'SET_CURRENT_SECTION', section });
  };

  const validateSection = (section: string): boolean => {
    const requiredFields: Record<string, (keyof OnboardingFormData)[]> = {
      company: ['companyTradingName', 'operatingHours', 'companyAddress', 'companyPhone', 'companyEmail'],
      policies: ['sickLeavePolicy', 'annualLeavePolicy', 'probationPeriod', 'noticePeriodEmployee', 'noticePeriodEmployer'],
      additional: ['industry', 'numberOfEmployees'],
    };

    const fields = requiredFields[section] || [];
    return fields.every(field => {
      const value = state.formData[field];
      return typeof value === 'string' ? value.trim().length > 0 : false;
    });
  };

  const isFieldValid = (field: keyof OnboardingFormData): boolean => {
    const value = state.formData[field];
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  };

  const getFieldError = (field: string): string => {
    return state.errors[field] || '';
  };

  const submitForm = async (): Promise<void> => {
    dispatch({ type: 'SUBMIT_FORM' });

    try {
      // Validate all required fields
      const requiredFields: (keyof OnboardingFormData)[] = [
        'companyTradingName', 'operatingHours', 'companyAddress', 'companyPhone', 'companyEmail',
        'sickLeavePolicy', 'annualLeavePolicy', 'probationPeriod', 'noticePeriodEmployee', 'noticePeriodEmployer',
        'industry', 'numberOfEmployees'
      ];

      const validationErrors: Record<string, string> = {};
      requiredFields.forEach(field => {
        if (!isFieldValid(field)) {
          validationErrors[field] = 'This field is required';
        }
      });

      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          dispatch({ type: 'SET_ERROR', field, message });
        });
        dispatch({ type: 'SUBMIT_ERROR', error: 'Please fill in all required fields' });
        return;
      }

      // Prepare form data for submission
      const formData = new URLSearchParams();
      
      // Add clientId for MVP (in production, this would come from authentication)
      formData.append('clientId', 'demo-client-123');
      
      Object.entries(state.formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            // For MVP, skip file uploads for now
            console.log('File upload skipped in MVP mode:', key, value.name);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Submit to backend
      const response = await fetch('/api/backend/onboarding/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || 'your_strong_secret_token_here'}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit form';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, get the text content
          const textContent = await response.text();
          errorMessage = `Server Error (${response.status}): ${textContent.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }

      // Clear saved data and show success
      sessionStorage.removeItem('onboardingFormData');
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      console.error('Form submission error:', error);
      dispatch({ 
        type: 'SUBMIT_ERROR', 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    }
  };

  const contextValue: OnboardingContextType = {
    state,
    dispatch,
    updateField,
    setCurrentSection,
    submitForm,
    validateSection,
    isFieldValid,
    getFieldError,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the context
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
