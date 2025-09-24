'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Check, Building2, FileText, Info, Eye } from 'lucide-react';
import { FormSection } from '@/types';

const ProgressTracker: React.FC = () => {
  const { state, validateSection } = useOnboarding();

  const sections: FormSection[] = [
    {
      id: 'company',
      title: 'Company Details',
      description: 'Basic company information',
      isComplete: validateSection('company'),
      fields: ['companyTradingName', 'operatingHours', 'companyAddress', 'companyPhone', 'companyEmail'],
    },
    {
      id: 'policies',
      title: 'HR Policies',
      description: 'Leave and employment policies',
      isComplete: validateSection('policies'),
      fields: ['sickLeavePolicy', 'annualLeavePolicy', 'probationPeriod', 'noticePeriodEmployee', 'noticePeriodEmployer'],
    },
    {
      id: 'additional',
      title: 'Additional Info',
      description: 'Industry and employee details',
      isComplete: validateSection('additional'),
      fields: ['industry', 'numberOfEmployees'],
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review and submit your information',
      isComplete: false,
      fields: [],
    },
  ];

  const getSectionIcon = (section: FormSection) => {
    const iconClass = "h-5 w-5";
    
    if (section.isComplete) {
      return <Check className={`${iconClass} text-white`} />;
    }
    
    switch (section.id) {
      case 'company':
        return <Building2 className={`${iconClass} text-white`} />;
      case 'policies':
        return <FileText className={`${iconClass} text-white`} />;
      case 'additional':
        return <Info className={`${iconClass} text-white`} />;
      case 'review':
        return <Eye className={`${iconClass} text-white`} />;
      default:
        return <div className={`${iconClass} bg-white rounded-full`} />;
    }
  };

  const getSectionStatus = (section: FormSection) => {
    if (section.id === state.currentSection) {
      return 'current';
    }
    if (section.isComplete) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {sections.map((section, index) => {
          const status = getSectionStatus(section);
          const isLast = index === sections.length - 1;
          
          return (
            <React.Fragment key={section.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200
                    ${status === 'completed' 
                      ? 'bg-green-500 shadow-lg' 
                      : status === 'current' 
                        ? 'bg-hr-600 shadow-lg ring-4 ring-hr-200' 
                        : 'bg-gray-300'
                    }
                  `}
                >
                  {getSectionIcon(section)}
                </div>
                
                <div className="text-center">
                  <h3 className={`
                    text-sm font-medium mb-1
                    ${status === 'current' ? 'text-hr-600' : status === 'completed' ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {section.title}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-24">
                    {section.description}
                  </p>
                </div>
              </div>
              
              {!isLast && (
                <div className={`
                  flex-1 h-0.5 mx-4 mt-5 transition-colors duration-200
                  ${sections[index + 1].isComplete || sections[index + 1].id === state.currentSection
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                  }
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Step {sections.findIndex(s => s.id === state.currentSection) + 1} of {sections.length}: {sections.find(s => s.id === state.currentSection)?.title}
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;
