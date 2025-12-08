import React, { useState } from 'react';
import { FiSearch, FiUser, FiMail, FiLock, FiPhone, FiMapPin } from 'react-icons/fi';
import { InputWithIcon } from '../common/InputWithIcon';
import { FormInput } from '../common/FormInput';

/**
 * IconInputExamples - Demonstrates the different ways to implement input fields with icons
 * 
 * This component showcases:
 * 1. InputWithIcon component with different spacing options
 * 2. FormInput component with new icon spacing system
 * 3. Manual implementation with CSS utility classes
 * 4. Comparison between old and new approaches
 */
export const IconInputExamples: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [usernameValue, setUsernameValue] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Icon Input Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating consistent icon spacing patterns across different input components
        </p>
      </div>

      {/* InputWithIcon Component Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          1. InputWithIcon Component (Recommended)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Compact Spacing (44px)
            </label>
            <InputWithIcon
              leftIcon={<FiUser className="h-4 w-4" />}
              placeholder="Username"
              iconSpacing="compact"
              value={usernameValue}
              onChange={(e) => setUsernameValue(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Standard Spacing (56px)
            </label>
            <InputWithIcon
              leftIcon={<FiSearch className="h-5 w-5" />}
              placeholder="Search..."
              iconSpacing="standard"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Large Spacing (64px)
            </label>
            <InputWithIcon
              leftIcon={<FiSearch className="h-6 w-6" />}
              placeholder="Search with large icon"
              iconSpacing="large"
            />
          </div>
        </div>
      </section>

      {/* FormInput with New Icon Spacing */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          2. FormInput with New Icon Spacing System
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="email-new"
            type="email"
            label="Email (New Spacing)"
            placeholder="Enter your email"
            icon={<FiMail className="h-5 w-5" />}
            useIconSpacing={true}
            iconSpacing="standard"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
          />
          
          <FormInput
            id="password-new"
            type="password"
            label="Password (Compact Spacing)"
            placeholder="Enter password"
            icon={<FiLock className="h-4 w-4" />}
            useIconSpacing={true}
            iconSpacing="compact"
          />
        </div>
      </section>

      {/* Manual Implementation Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          3. Manual Implementation with CSS Classes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="input-icon-left">
                <FiPhone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                className="block w-full input-with-left-icon pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location (Compact)
            </label>
            <div className="relative">
              <div className="input-icon-left">
                <FiMapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                className="block w-full input-with-left-icon-compact pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          4. Comparison: Old vs New Approach
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormInput
              id="email-old"
              type="email"
              label="Email (Old Bordered Style)"
              placeholder="Enter your email"
              icon={<FiMail className="h-5 w-5" />}
              useIconSpacing={false}
            />
          </div>
          
          <div>
            <FormInput
              id="email-new-comparison"
              type="email"
              label="Email (New Icon Spacing)"
              placeholder="Enter your email"
              icon={<FiMail className="h-5 w-5" />}
              useIconSpacing={true}
              iconSpacing="standard"
            />
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Usage Guidelines
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          <li><strong>Compact (44px):</strong> Use for small icons (16px) in tight layouts</li>
          <li><strong>Standard (56px):</strong> Default choice for most icons (20px)</li>
          <li><strong>Large (64px):</strong> Use for prominent search fields or large icons (24px)</li>
          <li><strong>InputWithIcon:</strong> Recommended for new implementations</li>
          <li><strong>FormInput with useIconSpacing:</strong> For form contexts with labels</li>
          <li><strong>CSS Classes:</strong> For custom implementations or existing components</li>
        </ul>
      </section>
    </div>
  );
};

export default IconInputExamples;
