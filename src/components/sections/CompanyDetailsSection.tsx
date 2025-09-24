'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import FormField from '../FormField';
import SectionNavigation from '../SectionNavigation';

const CompanyDetailsSection: React.FC = () => {
  const { state, updateField, getFieldError, validateSection } = useOnboarding();

  const handleNext = () => {
    if (validateSection('company')) {
      // Move to next section logic would be handled by parent
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Company Details</h2>
        <p className="text-gray-600">
          Please provide your company's basic information. This will be used to set up your account and create your employee handbook.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <FormField
            id="companyTradingName"
            label="Company Trading Name"
            value={state.formData.companyTradingName}
            onChange={(value) => updateField('companyTradingName', value)}
            placeholder="e.g., Acme Corporation Ltd"
            required
            error={getFieldError('companyTradingName')}
          />
        </div>

        <FormField
          id="companyPhone"
          label="Company Phone"
          value={state.formData.companyPhone}
          onChange={(value) => updateField('companyPhone', value)}
          placeholder="+1 (555) 123-4567"
          type="tel"
          required
          error={getFieldError('companyPhone')}
        />

        <FormField
          id="companyEmail"
          label="Company Email"
          value={state.formData.companyEmail}
          onChange={(value) => updateField('companyEmail', value)}
          placeholder="contact@company.com"
          type="email"
          required
          error={getFieldError('companyEmail')}
        />

        <div className="md:col-span-2">
          <FormField
            id="companyAddress"
            label="Company Address"
            value={state.formData.companyAddress}
            onChange={(value) => updateField('companyAddress', value)}
            placeholder="123 Business Street, City, State, ZIP Code"
            type="textarea"
            rows={3}
            required
            error={getFieldError('companyAddress')}
          />
        </div>

        <div className="md:col-span-2">
          <FormField
            id="operatingHours"
            label="Operating Hours"
            value={state.formData.operatingHours}
            onChange={(value) => updateField('operatingHours', value)}
            placeholder="e.g., Monday to Friday, 9:00 AM - 5:00 PM"
            required
            error={getFieldError('operatingHours')}
          />
        </div>
      </div>

      <SectionNavigation 
        canProceed={validateSection('company')}
        nextSection="policies"
        nextLabel="Continue to HR Policies"
      />
    </div>
  );
};

export default CompanyDetailsSection;
