'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import Header from './Header';
import ProgressTracker from './ProgressTracker';
import CompanyDetailsSection from './sections/CompanyDetailsSection';
import PoliciesSection from './sections/PoliciesSection';
import AdditionalInfoSection from './sections/AdditionalInfoSection';
import ReviewSection from './sections/ReviewSection';
import ConfirmationModal from './ConfirmationModal';
import ErrorBoundary from './ErrorBoundary';

const OnboardingHub: React.FC = () => {
  const { state } = useOnboarding();

  if (state.submitSuccess) {
    return <ConfirmationModal />;
  }

  const renderCurrentSection = () => {
    switch (state.currentSection) {
      case 'company':
        return <CompanyDetailsSection />;
      case 'policies':
        return <PoliciesSection />;
      case 'additional':
        return <AdditionalInfoSection />;
      case 'review':
        return <ReviewSection />;
      default:
        return <CompanyDetailsSection />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto">
        <Header />
        
        <div className="card mt-6">
          <ProgressTracker />
          
          <div className="mt-8">
            {renderCurrentSection()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default OnboardingHub;
