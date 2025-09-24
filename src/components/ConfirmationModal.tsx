'use client';

import React from 'react';
import { CheckCircle, Mail, Phone, Calendar } from 'lucide-react';

const ConfirmationModal: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for completing your onboarding application. We've received all your information and will begin setting up your HR services.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-4">What happens next?</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Account Setup</p>
                <p className="text-sm text-green-700">We'll set up your Maxio billing account and create your customer record within 1-2 business days.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-green-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Welcome Email</p>
                <p className="text-sm text-green-700">You'll receive a welcome email with your account details and next steps.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Phone className="h-5 w-5 text-green-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Account Manager Contact</p>
                <p className="text-sm text-green-700">Your dedicated Account Manager will contact you within 3-5 business days to discuss your HR setup.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-4">
            If you have any questions or need to make changes to your application, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@thehrcompany.com"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </a>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This application has been automatically saved to your CRM record and will be processed by our team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
