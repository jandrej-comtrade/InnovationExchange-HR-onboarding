'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import SectionNavigation from '../SectionNavigation';
import { CheckCircle, Building2, FileText, Info } from 'lucide-react';

const ReviewSection: React.FC = () => {
  const { state, submitForm } = useOnboarding();

  const handleSubmit = async () => {
    await submitForm();
  };

  const formatValue = (value: string | File | null): string => {
    if (value === null || value === undefined) return 'Not provided';
    if (value instanceof File) return value.name;
    return value.toString();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review Your Information</h2>
        <p className="text-gray-600">
          Please review all the information below before submitting. You can go back to make changes if needed.
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-hr-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Company Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Company Name:</span>
              <p className="text-gray-900">{formatValue(state.formData.companyTradingName)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <p className="text-gray-900">{formatValue(state.formData.companyPhone)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-900">{formatValue(state.formData.companyEmail)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Operating Hours:</span>
              <p className="text-gray-900">{formatValue(state.formData.operatingHours)}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Address:</span>
              <p className="text-gray-900">{formatValue(state.formData.companyAddress)}</p>
            </div>
          </div>
        </div>

        {/* HR Policies */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-hr-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">HR Policies</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Probation Period:</span>
              <p className="text-gray-900">{formatValue(state.formData.probationPeriod)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Working Hours:</span>
              <p className="text-gray-900">{formatValue(state.formData.workingHours)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Employee Notice:</span>
              <p className="text-gray-900">{formatValue(state.formData.noticePeriodEmployee)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Employer Notice:</span>
              <p className="text-gray-900">{formatValue(state.formData.noticePeriodEmployer)}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Sick Leave Policy:</span>
              <p className="text-gray-900">{formatValue(state.formData.sickLeavePolicy)}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Annual Leave Policy:</span>
              <p className="text-gray-900">{formatValue(state.formData.annualLeavePolicy)}</p>
            </div>
            {state.formData.overtimePolicy && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Overtime Policy:</span>
                <p className="text-gray-900">{formatValue(state.formData.overtimePolicy)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Info className="h-5 w-5 text-hr-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Industry:</span>
              <p className="text-gray-900">{formatValue(state.formData.industry)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Number of Employees:</span>
              <p className="text-gray-900">{formatValue(state.formData.numberOfEmployees)}</p>
            </div>
            {state.formData.specialRequirements && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Special Requirements:</span>
                <p className="text-gray-900">{formatValue(state.formData.specialRequirements)}</p>
              </div>
            )}
            {state.formData.supportingDocument && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Supporting Document:</span>
                <p className="text-gray-900">{formatValue(state.formData.supportingDocument)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {state.errors.general && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{state.errors.general}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionNavigation 
        canProceed={true}
        onSubmit={handleSubmit}
        isSubmitting={state.isSubmitting}
        previousSection="additional"
        previousLabel="Back to Additional Information"
      />
    </div>
  );
};

export default ReviewSection;
