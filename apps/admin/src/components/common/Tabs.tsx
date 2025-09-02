import React, { useState, ReactNode } from 'react';

interface Tab {
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <span
              key={tab.label}
              onClick={() => onTabChange(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onTabChange(index);
                }
              }}
              className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none cursor-pointer ${
                activeTab === index
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon && <span className="mr-2 h-5 w-5">{tab.icon}</span>}
              {tab.label}
            </span>
          ))}
        </nav>
      </div>
      <div className="pt-3">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md dark:bg-gray-800">
          {tabs[activeTab] && tabs[activeTab].content}
        </div>
      </div>
    </div>
  );
};

export default Tabs; 