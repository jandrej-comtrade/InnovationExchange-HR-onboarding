'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import FormField from '../FormField';
import SectionNavigation from '../SectionNavigation';

const AdditionalInfoSection: React.FC = () => {
  const { state, updateField, getFieldError, validateSection } = useOnboarding();

  const industryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance & Banking' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail & E-commerce' },
    { value: 'Education', label: 'Education' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Hospitality', label: 'Hospitality & Tourism' },
    { value: 'Professional Services', label: 'Professional Services' },
    { value: 'Non-profit', label: 'Non-profit' },
    { value: 'Other', label: 'Other' },
  ];

  const employeeCountOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Additional Information</h2>
        <p className="text-gray-600">
          Help us understand your business better to provide more tailored HR services.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="industry"
            label="Industry"
            value={state.formData.industry}
            onChange={(value) => updateField('industry', value)}
            type="select"
            options={industryOptions}
            required
            error={getFieldError('industry')}
          />

          <FormField
            id="numberOfEmployees"
            label="Number of Employees"
            value={state.formData.numberOfEmployees}
            onChange={(value) => updateField('numberOfEmployees', value)}
            type="select"
            options={employeeCountOptions}
            required
            error={getFieldError('numberOfEmployees')}
          />
        </div>

        <FormField
          id="specialRequirements"
          label="Special Requirements or Notes"
          value={state.formData.specialRequirements}
          onChange={(value) => updateField('specialRequirements', value)}
          placeholder="Any specific requirements, industry regulations, or additional information that should be considered for your HR setup..."
          type="textarea"
          rows={4}
          error={getFieldError('specialRequirements')}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Document Upload (Optional)</h3>
          <p className="text-sm text-blue-700 mb-3">
            If you have any existing HR documents, policies, or templates you'd like us to consider, you can upload them here.
          </p>
          <FormField
            id="supportingDocument"
            label="Supporting Documents"
            value=""
            onChange={(value) => updateField('supportingDocument', value)}
            type="file"
            error={getFieldError('supportingDocument')}
          />
        </div>
      </div>

      <SectionNavigation 
        canProceed={validateSection('additional')}
        nextSection="review"
        nextLabel="Review & Submit"
        previousSection="policies"
        previousLabel="Back to HR Policies"
      />
    </div>
  );
};

export default AdditionalInfoSection;
