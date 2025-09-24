'use client';

import React from 'react';
import { Building2, Users } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-hr-600 p-3 rounded-full mr-4">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          The HR Company
        </h1>
      </div>
      
      <div className="flex items-center justify-center mb-2">
        <Users className="h-5 w-5 text-hr-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-700">
          Unified Onboarding Hub
        </h2>
      </div>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Welcome! Please complete the form below to finalize your onboarding process. 
        This will help us set up your HR services and create your employee handbook.
      </p>
    </div>
  );
};

export default Header;
