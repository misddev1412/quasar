import React, { useState } from 'react';
import { DateInput } from '../../components/common/DateInput';
import { Card } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';

const DateInputTest: React.FC = () => {
  const [dateValue1, setDateValue1] = useState('');
  const [dateValue2, setDateValue2] = useState('2024-01-15');
  const [dateValue3, setDateValue3] = useState('');
  const [dateValue4, setDateValue4] = useState('');

  return (
    <BaseLayout 
      title="DateInput Component Test" 
      description="Test page for verifying DateInput calendar functionality"
    >
      <div className="space-y-8">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              DateInput Component Tests
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click on the date input fields below to test if the calendar picker appears. 
              The calendar should open when you click on the input field or the calendar icon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Test 1: Basic DateInput */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Basic DateInput
                </h3>
                <DateInput
                  id="date-test-1"
                  label="Select Date"
                  value={dateValue1}
                  onChange={setDateValue1}
                  placeholder="Choose a date"
                />
                <p className="text-sm text-gray-500">
                  Selected: {dateValue1 || 'None'}
                </p>
              </div>

              {/* Test 2: DateInput with initial value */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  DateInput with Initial Value
                </h3>
                <DateInput
                  id="date-test-2"
                  label="Birth Date"
                  value={dateValue2}
                  onChange={setDateValue2}
                  required
                />
                <p className="text-sm text-gray-500">
                  Selected: {dateValue2}
                </p>
              </div>

              {/* Test 3: DateInput with constraints */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  DateInput with Min/Max
                </h3>
                <DateInput
                  id="date-test-3"
                  label="Event Date"
                  value={dateValue3}
                  onChange={setDateValue3}
                  min="2024-01-01"
                  max="2024-12-31"
                />
                <p className="text-sm text-gray-500">
                  Selected: {dateValue3 || 'None'} (Range: 2024 only)
                </p>
              </div>

              {/* Test 4: Small size DateInput */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Small Size DateInput
                </h3>
                <DateInput
                  id="date-test-4"
                  label="Compact Date"
                  value={dateValue4}
                  onChange={setDateValue4}
                  size="sm"
                />
                <p className="text-sm text-gray-500">
                  Selected: {dateValue4 || 'None'}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Testing Instructions
              </h4>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                <li>• Click on any date input field to open the calendar picker</li>
                <li>• The calendar should appear as a native browser date picker</li>
                <li>• You should be able to select dates and see them reflected in the input</li>
                <li>• The custom calendar icon should be visible on the right side</li>
                <li>• The calendar picker should work in both light and dark themes</li>
              </ul>
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Debug Information
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Browser: {navigator.userAgent}</p>
                <p>Date Input Support: {(() => {
                  const input = document.createElement('input');
                  input.type = 'date';
                  return input.type === 'date' ? 'Yes' : 'No';
                })()}</p>
                <p>Current Values:</p>
                <ul className="ml-4 space-y-1">
                  <li>Basic: {dateValue1 || 'Empty'}</li>
                  <li>With Initial: {dateValue2}</li>
                  <li>With Constraints: {dateValue3 || 'Empty'}</li>
                  <li>Small Size: {dateValue4 || 'Empty'}</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default DateInputTest;
