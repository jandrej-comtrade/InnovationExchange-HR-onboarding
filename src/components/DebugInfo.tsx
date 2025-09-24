'use client';

import React, { useState } from 'react';

const DebugInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('Not tested');

  const testAPI = async () => {
    try {
      const response = await fetch('/api/backend/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || 'your_strong_secret_token_here'}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ API Working: ${data.message}`);
      } else {
        setApiStatus(`❌ API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiStatus(`❌ Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show debug info in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">Debug Info</h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-500"
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {isVisible && (
        <div className="space-y-2 text-xs">
          <div>
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </div>
          <div>
            <strong>Backend URL:</strong> {process.env.BACKEND_URL || 'http://localhost:3001'}
          </div>
          <div>
            <strong>API Token:</strong> {process.env.NEXT_PUBLIC_API_TOKEN ? 'Set' : 'Using default'}
          </div>
          <div>
            <strong>Client ID:</strong> demo-client-123
          </div>
          <div>
            <strong>API Status:</strong> {apiStatus}
          </div>
          <button
            onClick={testAPI}
            className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Test API Connection
          </button>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;
