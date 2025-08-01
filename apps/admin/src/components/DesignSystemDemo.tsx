import React, { useState } from 'react';
import { Checkbox } from './common/Checkbox';

const DesignSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('colors');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: 'general',
    notifications: false,
    marketing: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'forms', label: 'Forms' },
    { id: 'layout', label: 'Layout' },
    { id: 'responsive', label: 'Responsive' },
  ];

  const colorCategories = [
    {
      name: 'Primary',
      colors: ['primary-50', 'primary-100', 'primary-200', 'primary-300', 'primary-400', 'primary-500', 'primary-600', 'primary-700', 'primary-800', 'primary-900', 'primary-950']
    },
    {
      name: 'Secondary',
      colors: ['secondary-50', 'secondary-100', 'secondary-200', 'secondary-300', 'secondary-400', 'secondary-500', 'secondary-600', 'secondary-700', 'secondary-800', 'secondary-900', 'secondary-950']
    },
    {
      name: 'Success',
      colors: ['success-50', 'success-100', 'success-200', 'success-300', 'success-400', 'success-500', 'success-600', 'success-700', 'success-800', 'success-900', 'success-950']
    },
    {
      name: 'Warning',
      colors: ['warning-50', 'warning-100', 'warning-200', 'warning-300', 'warning-400', 'warning-500', 'warning-600', 'warning-700', 'warning-800', 'warning-900', 'warning-950']
    },
    {
      name: 'Error',
      colors: ['error-50', 'error-100', 'error-200', 'error-300', 'error-400', 'error-500', 'error-600', 'error-700', 'error-800', 'error-900', 'error-950']
    },
    {
      name: 'Neutral',
      colors: ['neutral-50', 'neutral-100', 'neutral-200', 'neutral-300', 'neutral-400', 'neutral-500', 'neutral-600', 'neutral-700', 'neutral-800', 'neutral-900', 'neutral-950']
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quasar Design System</h1>
          <p className="text-lg text-neutral-600">A comprehensive design system with colors, typography, components, and responsive utilities.</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Color Palette</h2>
                  <p className="text-neutral-600 mb-6">Our comprehensive color system with semantic tokens for consistent theming.</p>
                </div>

                {colorCategories.map((category) => (
                  <div key={category.name}>
                    <h3 className="text-lg font-medium text-neutral-900 mb-3">{category.name}</h3>
                    <div className="grid grid-cols-11 gap-2 mb-6">
                      {category.colors.map((color) => (
                        <div key={color} className="text-center">
                          <div
                            className={`w-full h-16 rounded-lg border border-neutral-200 bg-${color} mb-2`}
                            title={color}
                          />
                          <div className="text-xs text-neutral-600 font-mono">{color.split('-')[1]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-neutral-100 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Semantic Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-primary-500 text-white p-4 rounded-lg text-center">
                      <div className="font-medium">Primary Action</div>
                      <div className="text-sm opacity-90">bg-primary-500</div>
                    </div>
                    <div className="bg-success-500 text-white p-4 rounded-lg text-center">
                      <div className="font-medium">Success State</div>
                      <div className="text-sm opacity-90">bg-success-500</div>
                    </div>
                    <div className="bg-warning-500 text-white p-4 rounded-lg text-center">
                      <div className="font-medium">Warning State</div>
                      <div className="text-sm opacity-90">bg-warning-500</div>
                    </div>
                    <div className="bg-error-500 text-white p-4 rounded-lg text-center">
                      <div className="font-medium">Error State</div>
                      <div className="text-sm opacity-90">bg-error-500</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Typography</h2>
                  <p className="text-neutral-600 mb-6">Consistent typography scale with semantic text colors and responsive design.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Headings</h3>
                    <div className="space-y-4">
                      <h1 className="text-5xl font-bold text-neutral-900">Heading 1 (5xl)</h1>
                      <h2 className="text-4xl font-bold text-neutral-900">Heading 2 (4xl)</h2>
                      <h3 className="text-3xl font-semibold text-neutral-900">Heading 3 (3xl)</h3>
                      <h4 className="text-2xl font-semibold text-neutral-900">Heading 4 (2xl)</h4>
                      <h5 className="text-xl font-medium text-neutral-900">Heading 5 (xl)</h5>
                      <h6 className="text-lg font-medium text-neutral-900">Heading 6 (lg)</h6>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Body Text</h3>
                    <div className="space-y-3">
                      <p className="text-lg text-neutral-700">Large body text (text-lg) - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                      <p className="text-base text-neutral-700">Base body text (text-base) - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                      <p className="text-sm text-neutral-600">Small body text (text-sm) - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                      <p className="text-xs text-neutral-500">Extra small text (text-xs) - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Text Colors</h3>
                    <div className="space-y-2">
                      <p className="text-neutral-900">Primary text color (text-neutral-900)</p>
                      <p className="text-neutral-600">Secondary text color (text-neutral-600)</p>
                      <p className="text-neutral-500">Tertiary text color (text-neutral-500)</p>
                      <p className="text-neutral-400">Disabled text color (text-neutral-400)</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Font Families</h3>
                    <div className="space-y-3">
                      <p className="font-sans text-base">Sans-serif font family (Inter) - The quick brown fox jumps over the lazy dog.</p>
                      <p className="font-mono text-base">Monospace font family (JetBrains Mono) - The quick brown fox jumps over the lazy dog.</p>
                      <p className="font-serif text-base">Serif font family (Georgia) - The quick brown fox jumps over the lazy dog.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons Tab */}
            {activeTab === 'buttons' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Buttons</h2>
                  <p className="text-neutral-600 mb-6">Button variants with consistent styling and interactive states.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Primary Buttons</h3>
                    <div className="space-y-3">
                      <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Primary Button
                      </button>
                      <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                        Large Primary
                      </button>
                      <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-1.5 px-3 text-sm rounded-lg transition-colors">
                        Small Primary
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Secondary Buttons</h3>
                    <div className="space-y-3">
                      <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium py-2 px-4 rounded-lg transition-colors border border-neutral-200">
                        Secondary Button
                      </button>
                      <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium py-3 px-6 rounded-lg transition-colors border border-neutral-200">
                        Large Secondary
                      </button>
                      <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium py-1.5 px-3 text-sm rounded-lg transition-colors border border-neutral-200">
                        Small Secondary
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Outline Buttons</h3>
                    <div className="space-y-3">
                      <button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Outline Button
                      </button>
                      <button className="border-2 border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Secondary Outline
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">State Buttons</h3>
                    <div className="space-y-3">
                      <button className="bg-success-500 hover:bg-success-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Success Button
                      </button>
                      <button className="bg-warning-500 hover:bg-warning-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Warning Button
                      </button>
                      <button className="bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Error Button
                      </button>
                      <button disabled className="bg-neutral-300 text-neutral-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed">
                        Disabled Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Forms Tab */}
            {activeTab === 'forms' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Form Elements</h2>
                  <p className="text-neutral-600 mb-6">Consistent form styling with validation states and accessibility.</p>
                </div>

                <div className="max-w-2xl">
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Enter your full name"
                        required
                      />
                      <p className="mt-1 text-sm text-neutral-500">Please enter your complete name.</p>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="feature">Feature Request</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <div className="space-y-4">
                      {/* Enhanced Native Checkbox */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notifications"
                          name="notifications"
                          checked={formData.notifications}
                          onChange={handleInputChange}
                          className="enhanced-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                        <label htmlFor="notifications" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                          Send me email notifications (Enhanced Native)
                        </label>
                      </div>

                      {/* Radix UI Checkbox Component */}
                      <div className="flex items-center">
                        <Checkbox
                          id="marketing"
                          checked={formData.marketing || false}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketing: checked as boolean }))}
                        />
                        <label htmlFor="marketing" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                          Receive marketing updates (Radix UI Component)
                        </label>
                      </div>

                      {/* Disabled State Example */}
                      <div className="flex items-center">
                        <Checkbox
                          id="disabled-example"
                          checked={false}
                          disabled
                        />
                        <label htmlFor="disabled-example" className="ml-2 block text-sm text-neutral-500 dark:text-neutral-500">
                          Disabled checkbox example
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        Submit Form
                      </button>
                      <button
                        type="button"
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium py-2 px-6 rounded-lg transition-colors border border-neutral-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-medium text-neutral-900">Form States</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Success State</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-success-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-success-500 bg-success-50"
                        defaultValue="Form submitted successfully!"
                        readOnly
                      />
                      <p className="mt-1 text-sm text-success-600">Your form has been submitted successfully.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Error State</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-error-300 rounded-lg focus:ring-2 focus:ring-error-500 focus:border-error-500 bg-error-50"
                        defaultValue="Invalid input"
                      />
                      <p className="mt-1 text-sm text-error-600">Please enter a valid email address.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Warning State</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-warning-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-warning-500 bg-warning-50"
                        defaultValue="Please verify this information"
                      />
                      <p className="mt-1 text-sm text-warning-600">This field requires verification.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Layout Components</h2>
                  <p className="text-neutral-600 mb-6">Layout utilities, containers, and spacing examples.</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Cards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                          <h4 className="text-lg font-semibold text-neutral-900 mb-2">Card Title {i}</h4>
                          <p className="text-neutral-600 mb-4">This is a sample card with some content to demonstrate the card layout and styling.</p>
                          <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            Learn More
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Flexbox Layout</h3>
                    <div className="bg-neutral-100 rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
                          <h4 className="font-medium text-neutral-900">Flexible Content</h4>
                          <p className="text-sm text-neutral-600">This content adapts to available space.</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm flex-none">
                          <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            Fixed Width
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">Centered</div>
                        <div className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">Aligned</div>
                        <div className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm font-medium">Items</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Container Sizes</h3>
                    <div className="space-y-4">
                      <div className="bg-primary-100 rounded-lg p-4">
                        <div className="max-w-sm mx-auto bg-white p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-600">Small container (max-w-sm)</p>
                        </div>
                      </div>
                      <div className="bg-secondary-100 rounded-lg p-4">
                        <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-600">Medium container (max-w-2xl)</p>
                        </div>
                      </div>
                      <div className="bg-success-100 rounded-lg p-4">
                        <div className="max-w-6xl mx-auto bg-white p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-600">Large container (max-w-6xl)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Responsive Tab */}
            {activeTab === 'responsive' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Responsive Design</h2>
                  <p className="text-neutral-600 mb-6">Mobile-first responsive utilities and breakpoint demonstrations.</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Breakpoint Indicators</h3>
                    <div className="grid grid-cols-1 gap-4">
                                             <div className="bg-neutral-100 p-4 rounded-lg text-center">
                         <span className="sm:hidden inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">XS (&lt; 640px)</span>
                         <span className="hidden sm:inline-block md:hidden bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">SM (640px - 767px)</span>
                         <span className="hidden md:inline-block lg:hidden bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">MD (768px - 1023px)</span>
                         <span className="hidden lg:inline-block xl:hidden bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">LG (1024px - 1279px)</span>
                         <span className={`hidden xl:inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium ${'2xl:hidden'}`}>XL (1280px - 1535px)</span>
                         <span className={`hidden bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium ${'2xl:inline-block'}`}>2XL (≥ 1536px)</span>
                       </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Responsive Grid</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-primary-100 p-4 rounded-lg text-center">
                          <div className="font-medium text-primary-800">Item {i}</div>
                          <div className="text-sm text-primary-600 mt-1">
                            <span className="sm:hidden">1 col</span>
                            <span className="hidden sm:inline lg:hidden">2 cols</span>
                            <span className="hidden lg:inline xl:hidden">3 cols</span>
                            <span className="hidden xl:inline">4 cols</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Responsive Text</h3>
                    <div className="bg-neutral-100 rounded-lg p-6">
                      <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 mb-4">
                        Responsive Heading
                      </h4>
                      <p className="text-sm sm:text-base lg:text-lg text-neutral-600 mb-4">
                        This text scales with the viewport size. On mobile it's smaller, on tablet it's medium, and on desktop it's larger.
                      </p>
                      <div className="text-center sm:text-left lg:text-center">
                        <span className="bg-primary-500 text-white px-4 py-2 rounded-lg inline-block">
                          <span className="sm:hidden">Mobile Center</span>
                          <span className="hidden sm:inline lg:hidden">Tablet Left</span>
                          <span className="hidden lg:inline">Desktop Center</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Responsive Spacing</h3>
                    <div className="space-y-4">
                      <div className="bg-secondary-100 p-2 sm:p-4 lg:p-8 rounded-lg">
                        <div className="bg-white p-4 rounded-lg text-center">
                          <p className="text-secondary-800 font-medium">Responsive Padding</p>
                          <p className="text-sm text-secondary-600 mt-1">
                            <span className="sm:hidden">Small (p-2)</span>
                            <span className="hidden sm:inline lg:hidden">Medium (p-4)</span>
                            <span className="hidden lg:inline">Large (p-8)</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-4 lg:space-y-8">
                        <div className="bg-success-100 p-4 rounded-lg text-center">
                          <p className="text-success-800 font-medium">Item 1</p>
                        </div>
                        <div className="bg-success-100 p-4 rounded-lg text-center">
                          <p className="text-success-800 font-medium">Item 2</p>
                        </div>
                        <div className="bg-success-100 p-4 rounded-lg text-center">
                          <p className="text-success-800 font-medium">Item 3</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
          <p className="text-neutral-600">
            This demo showcases the comprehensive Quasar Design System.{' '}
            <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">
              View Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemDemo; 