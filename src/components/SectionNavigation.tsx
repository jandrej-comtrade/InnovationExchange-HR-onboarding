'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface SectionNavigationProps {
  canProceed: boolean;
  nextSection?: string;
  nextLabel?: string;
  previousSection?: string;
  previousLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  canProceed,
  nextSection,
  nextLabel = 'Continue',
  previousSection,
  previousLabel = 'Back',
  onSubmit,
  isSubmitting = false,
}) => {
  const { setCurrentSection } = useOnboarding();

  const handleNext = () => {
    if (nextSection) {
      setCurrentSection(nextSection as any);
    }
  };

  const handlePrevious = () => {
    if (previousSection) {
      setCurrentSection(previousSection as any);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
      <div>
        {previousSection && (
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hr-500 transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {previousLabel}
          </button>
        )}
      </div>

      <div>
        {onSubmit ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed || isSubmitting}
            className={`
              inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${canProceed && !isSubmitting
                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submit Application
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`
              inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${canProceed
                ? 'bg-hr-600 hover:bg-hr-700 text-white focus:ring-hr-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionNavigation;
