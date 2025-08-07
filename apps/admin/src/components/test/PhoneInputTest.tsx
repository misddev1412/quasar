import React, { useState } from 'react';
import { PhoneInputField } from '../common/PhoneInputField';
import { Phone } from 'lucide-react';

export const PhoneInputTest: React.FC = () => {
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneValue(value || '');
    
    // Simple validation for demo
    if (value && value.length > 0 && value.length < 8) {
      setError('Phone number seems too short');
    } else {
      setError('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
        Phone Input Test
      </h2>
      
      <PhoneInputField
        id="test-phone"
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phoneValue}
        onChange={handlePhoneChange}
        icon={<Phone className="w-4 h-4" />}
        error={error}
        required
        defaultCountry="US"
      />
      
      <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-700 rounded">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Current value: <code className="bg-neutral-200 dark:bg-neutral-600 px-1 rounded">{phoneValue || 'empty'}</code>
        </p>
      </div>
    </div>
  );
};
