'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import FormField from '../FormField';
import SectionNavigation from '../SectionNavigation';

const PoliciesSection: React.FC = () => {
  const { state, updateField, getFieldError, validateSection } = useOnboarding();

  const probationOptions = [
    { value: '3 months', label: '3 months' },
    { value: '6 months', label: '6 months' },
    { value: '12 months', label: '12 months' },
    { value: 'Other', label: 'Other (specify in comments)' },
  ];

  const noticePeriodOptions = [
    { value: '1 week', label: '1 week' },
    { value: '2 weeks', label: '2 weeks' },
    { value: '1 month', label: '1 month' },
    { value: '2 months', label: '2 months' },
    { value: '3 months', label: '3 months' },
    { value: 'Other', label: 'Other (specify in comments)' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">HR Policies</h2>
        <p className="text-gray-600">
          Please specify your company's HR policies. These will be included in your employee handbook.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="sickLeavePolicy"
            label="Sick Leave Policy"
            value={state.formData.sickLeavePolicy}
            onChange={(value) => updateField('sickLeavePolicy', value)}
            placeholder="e.g., Statutory sick leave + 3 additional company days"
            type="textarea"
            rows={3}
            required
            error={getFieldError('sickLeavePolicy')}
          />

          <FormField
            id="annualLeavePolicy"
            label="Annual Leave Policy"
            value={state.formData.annualLeavePolicy}
            onChange={(value) => updateField('annualLeavePolicy', value)}
            placeholder="e.g., 25 days + public holidays"
            type="textarea"
            rows={3}
            required
            error={getFieldError('annualLeavePolicy')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="probationPeriod"
            label="Probation Period"
            value={state.formData.probationPeriod}
            onChange={(value) => updateField('probationPeriod', value)}
            type="select"
            options={probationOptions}
            required
            error={getFieldError('probationPeriod')}
          />

          <FormField
            id="workingHours"
            label="Standard Working Hours"
            value={state.formData.workingHours}
            onChange={(value) => updateField('workingHours', value)}
            placeholder="e.g., 40 hours per week, 8 hours per day"
            required
            error={getFieldError('workingHours')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="noticePeriodEmployee"
            label="Employee Notice Period"
            value={state.formData.noticePeriodEmployee}
            onChange={(value) => updateField('noticePeriodEmployee', value)}
            type="select"
            options={noticePeriodOptions}
            required
            error={getFieldError('noticePeriodEmployee')}
          />

          <FormField
            id="noticePeriodEmployer"
            label="Employer Notice Period"
            value={state.formData.noticePeriodEmployer}
            onChange={(value) => updateField('noticePeriodEmployer', value)}
            type="select"
            options={noticePeriodOptions}
            required
            error={getFieldError('noticePeriodEmployer')}
          />
        </div>

        <FormField
          id="overtimePolicy"
          label="Overtime Policy"
          value={state.formData.overtimePolicy}
          onChange={(value) => updateField('overtimePolicy', value)}
          placeholder="e.g., Overtime paid at 1.5x rate for hours over 40 per week"
          type="textarea"
          rows={3}
          error={getFieldError('overtimePolicy')}
        />
      </div>

      <SectionNavigation 
        canProceed={validateSection('policies')}
        nextSection="additional"
        nextLabel="Continue to Additional Information"
        previousSection="company"
        previousLabel="Back to Company Details"
      />
    </div>
  );
};

export default PoliciesSection;
