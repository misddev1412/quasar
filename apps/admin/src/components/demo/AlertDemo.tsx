import React from 'react';
import { AlertBox } from '../common/AlertBox';

export const AlertDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Enhanced Admin Access Error Alert Demo
        </h1>
        
        {/* Enhanced Admin Access Error */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Enhanced Admin Access Denied Error:</h2>
          <AlertBox
            type="error"
            size="lg"
            title="Access Denied"
            message="You do not have admin access"
            description="This system requires administrator privileges. Please contact your system administrator if you believe you should have access."
            footer="If you need assistance, please contact technical support for help."
            className="shadow-2xl border-red-300 ring-4 ring-red-100"
          />
        </div>

        {/* Original Small Error for Comparison */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Previous Small Error Display:</h2>
          <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
            <p>You do not have admin access</p>
          </div>
        </div>

        {/* Other Error Types for Reference */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Other Alert Types:</h2>
          
          <AlertBox
            type="warning"
            size="md"
            title="Warning"
            message="This is a warning message"
            description="Please review your settings before proceeding."
          />
          
          <AlertBox
            type="success"
            size="md"
            title="Success"
            message="Operation completed successfully"
            description="Your changes have been saved."
          />
          
          <AlertBox
            type="info"
            size="sm"
            title="Information"
            message="This is an informational message"
          />
        </div>
      </div>
    </div>
  );
};

export default AlertDemo;