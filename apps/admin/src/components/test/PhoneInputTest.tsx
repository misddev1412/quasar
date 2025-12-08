import React, { useState } from 'react';
import { PhoneInputField } from '../common/PhoneInputField';
import { CountrySelector } from '../common/CountrySelector';
import { Phone, Globe } from 'lucide-react';

export const PhoneInputTest: React.FC = () => {
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('US');

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Phone Input Dropdown Test - React Select Implementation
        </h1>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🔧 Simplified Dropdown Fix Testing
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">New Approach Applied:</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Switched to using react-select's built-in search functionality with enhanced filtering. This should resolve the dropdown closing issue.
            </p>
          </div>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
            <li>• <strong>Dropdown Stays Open:</strong> Click on country selector - dropdown should remain open</li>
            <li>• <strong>Built-in Search:</strong> Search input is now integrated into the control area</li>
            <li>• <strong>Enhanced Filtering:</strong> Search by country name, code, or calling code</li>
            <li>• <strong>Options Clickable:</strong> You should be able to click on country options</li>
            <li>• <strong>Clean UI:</strong> Selected country always visible when not searching</li>
            <li>• <strong>Country Name Search:</strong> Try "United", "Viet", "Germ" (fuzzy matching)</li>
            <li>• <strong>Country Code Search:</strong> Try "US", "GB", "DE", "VN"</li>
            <li>• <strong>Calling Code Search:</strong> Try "+1", "84", "44", "+49"</li>
            <li>• <strong>Alternative Names:</strong> Try "USA", "UK", "Britain", "America"</li>
            <li>• <strong>Search Highlighting:</strong> Notice matching text is highlighted in yellow</li>
          </ul>
        </div>

        {/* Test in different positions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top left */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Top Left Position
            </h2>
            <PhoneInputField
              id="test-phone-1"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneValue}
              onChange={handlePhoneChange}
              icon={<Phone className="w-4 h-4" />}
              error={error}
              required
              defaultCountry="US"
            />
          </div>

          {/* Top right */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Top Right Position
            </h2>
            <PhoneInputField
              id="test-phone-2"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneValue}
              onChange={handlePhoneChange}
              icon={<Phone className="w-4 h-4" />}
              error={error}
              required
              defaultCountry="GB"
            />
          </div>
        </div>

        {/* Middle section with more space */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Middle Section (Ideal Position)
          </h2>
          <div className="max-w-md">
            <PhoneInputField
              id="test-phone-3"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneValue}
              onChange={handlePhoneChange}
              icon={<Phone className="w-4 h-4" />}
              error={error}
              required
              defaultCountry="CA"
            />
          </div>

          <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-700 rounded">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Current value: <code className="bg-neutral-200 dark:bg-neutral-600 px-1 rounded">{phoneValue || 'empty'}</code>
            </p>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Error: {error}
              </p>
            )}
          </div>
        </div>

        {/* Bottom section to test upward positioning */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 mb-32">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Bottom Section (Should Open Upward)
          </h2>
          <div className="max-w-md">
            <PhoneInputField
              id="test-phone-4"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneValue}
              onChange={handlePhoneChange}
              icon={<Phone className="w-4 h-4" />}
              error={error}
              required
              defaultCountry="AU"
            />
          </div>
        </div>

        {/* Enhanced Search Testing Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Improved UI with In-Menu Search
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            The search input now appears within the dropdown menu, keeping the main control clean and professional.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Country Selector with Enhanced Search
              </label>
              <CountrySelector
                value={selectedCountry}
                onChange={setSelectedCountry}
                size="md"
              />
              <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Selected: <span className="font-medium">{selectedCountry}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Try These Search Examples:
              </h3>
              <div className="space-y-2 text-xs">
                <div className="bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                  <strong>Country Names:</strong> "United", "Viet", "Germ", "Austr"
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                  <strong>Country Codes:</strong> "US", "GB", "DE", "VN", "AU"
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                  <strong>Calling Codes:</strong> "+1", "84", "44", "+49", "61"
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                  <strong>Alternative Names:</strong> "USA", "UK", "Britain", "America"
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                  <strong>Fuzzy Search:</strong> "uni" → "United States", "ger" → "Germany"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Test Instructions */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            UI Improvements & Search Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ UI Improvements</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Clean main control (always shows selected country)</li>
                <li>• Search input positioned within dropdown menu</li>
                <li>• Auto-focus on search input when menu opens</li>
                <li>• Clear visual separation between search and options</li>
                <li>• Professional dropdown styling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Search Capabilities</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Search by country name (fuzzy matching)</li>
                <li>• Search by country code (US, GB, DE)</li>
                <li>• Search by calling code (+1, 84, +44)</li>
                <li>• Alternative names (USA, UK, Britain)</li>
                <li>• Search result highlighting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            🚨 Critical Dropdown Behavior Testing
          </h3>
          <div className="bg-red-100 dark:bg-red-800/30 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Test These Critical Behaviors:</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>1. <strong>Dropdown Opens:</strong> Click on any country selector - dropdown should open</li>
              <li>2. <strong>Dropdown Stays Open:</strong> Dropdown should NOT close immediately after opening</li>
              <li>3. <strong>Search Input Works:</strong> You should be able to type in the search field</li>
              <li>4. <strong>Options Are Clickable:</strong> You should be able to click on country options</li>
              <li>5. <strong>Proper Closing:</strong> Dropdown should only close when selecting a country or clicking outside</li>
            </ul>
          </div>
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Additional Testing:</h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <li>• <strong>Search Examples:</strong> Try "United", "US", "+1", "Britain", "uni"</li>
            <li>• <strong>Search Highlighting:</strong> Verify matching text is highlighted in yellow</li>
            <li>• <strong>Auto-Focus:</strong> Search input should automatically get focus when dropdown opens</li>
            <li>• <strong>Visual Separation:</strong> Clear separation between search area and options</li>
            <li>• <strong>Positioning:</strong> Dropdown should position correctly in all screen areas</li>
            <li>• <strong>Responsive:</strong> Test on different screen sizes</li>
            <li>• <strong>Dark Mode:</strong> Verify compatibility with dark theme</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
